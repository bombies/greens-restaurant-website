import { z } from "zod";
import { authenticatedAny, respondWithInit } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import { StockRequestStatus } from ".prisma/client";
import Prisma from "../../../../../../libs/prisma";
import prisma from "../../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { Inventory, RequestedStockItem, Stock } from "@prisma/client";
import { fetchCurrentSnapshots } from "../../../[name]/utils";

type Context = {
    params: {
        id: string
    }
}


export type ReviewInventoryRequestItem = {
    id: string,
    amountProvided: number,
    amountRequested: number,
}
export type ReviewInventoryRequestDto = {
    reviewedNotes?: string,
    items: ReviewInventoryRequestItem[]
}
const reviewInventoryRequestDtoSchema = z.object({
    reviewedNotes: z.string().optional(),
    items: z.array(z.object({
        id: z.string(),
        amountProvided: z.number()
    }))
});

export async function POST(req: Request, { params }: Context) {
    return authenticatedAny(req, async () => {
        const body: ReviewInventoryRequestDto = (await req.json());
        const bodyValidated = reviewInventoryRequestDtoSchema.safeParse(body);
        if (!bodyValidated.success)
            return respondWithInit({
                message: "Invalid payload!",
                validationErrors: bodyValidated,
                status: 401
            });

        /**
         * Generate the status of the request.
         * The status is initialized a delivered,
         * just being optimistic.
         */
        let status: StockRequestStatus = StockRequestStatus.DELIVERED;

        // Check if no stock were delivered.
        // If such was the case, the request was rejected.
        if (!body.items.reduce((prev, cur) => prev + cur.amountProvided, 0))
            status = StockRequestStatus.REJECTED;

        // If the status isn't rejected, check if there were any
        // items that weren't provided. If any are found, the request
        // is partially-delivered.
        if (status !== StockRequestStatus.REJECTED && body.items.find(item => item.amountProvided !== item.amountRequested))
            status = StockRequestStatus.PARTIALLY_DELIVERED;

        // If the status is still delivered, check
        // to ensure all the items provided are all
        // the items that are attached to the stock request.
        // If all the items aren't provided, the status will
        // be set to partially-delivered.
        if (status === StockRequestStatus.DELIVERED) {
            const stockRequestIds = (await prisma.stockRequest.findUnique({
                where: { id: params.id },
                select: { requestedItems: true }
            }))?.requestedItems.map(item => item.id);

            if (!stockRequestIds)
                return respondWithInit({
                    message: `There is no stock request with id: ${params.id}`,
                    status: 404
                });


            const bodyItemIds = body.items.map(item => item.id);
            for (let id in stockRequestIds)
                if (!bodyItemIds.includes(id)) {
                    status = StockRequestStatus.PARTIALLY_DELIVERED;
                    break;
                }
        }

        /**
         * Update the respective stock items
         */
        const items = await Prisma.$transaction(
            body.items.map(item => prisma.requestedStockItem.update({
                where: { id: item.id },
                data: { amountProvided: item.amountProvided },
                include: {
                    stock: {
                        include: {
                            inventory: true
                        }
                    }
                }
            }))
        );

        /**
         * Update the stock request with the new status
         */
        const request = await prisma.stockRequest.update({
            where: { id: params.id },
            data: { status }
        });

        /**
         * Update stock snapshots for the approved stock requests.
         */
        await updateSnapshots(items);

        return NextResponse.json({ ...request, requestedItems: items });
    }, [
        Permission.CREATE_INVENTORY,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
}

type RequestStockItemWithStockAndInventory = RequestedStockItem & {
    stock: Stock & {
        inventory: Inventory
    }
}

const updateSnapshots = async (items: RequestStockItemWithStockAndInventory[]) => {
    const transformedItems = transformItems(items);
    const snapshots = await fetchCurrentSnapshots(transformedItems.map(item => item.inventory.id));
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);

    return Prisma.$transaction(
        transformedItems.map(item =>
            item.items.map(requestedItem =>
                prisma.stockSnapshot.updateMany({
                    where: {
                        uid: requestedItem.stock.uid,
                        createdAt: {
                            gte: todaysDate
                        }
                    },
                    data: {
                        quantity: {
                            decrement: requestedItem.amountRequested
                        }
                    }
                })
            )
        ).flat()
    );
};

type InventoryWithRequestedStockItems = {
    inventory: Inventory,
    items: (RequestedStockItem & { stock: Stock })[]
}

const transformItems = (items: RequestStockItemWithStockAndInventory[]): InventoryWithRequestedStockItems[] => {
    const ret: InventoryWithRequestedStockItems[] = [];
    const hasInventory = (id: string) => {
        return !!ret.filter(obj => obj.inventory.id === id).length;
    };

    items.forEach(item => {
        const { stock, ...soleItem } = item;
        const { inventory, ...stockWithoutInventory } = stock;
        if (hasInventory(inventory.id)) {
            const index = ret.findIndex(inv => inv.inventory.id === inventory.id);
            ret[index] = {
                ...ret[index],
                items: [
                    ...ret[index].items,
                    {
                        ...soleItem,
                        stock: stockWithoutInventory
                    }
                ]
            };
        } else {
            ret.push({
                inventory,
                items: [{
                    ...soleItem,
                    stock: stockWithoutInventory
                }]
            });
        }
    });
    return ret;
};