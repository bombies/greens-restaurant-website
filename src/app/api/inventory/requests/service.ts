import { Either } from "../[name]/service";
import { Prisma, RequestedStockItem } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prisma";
import RequestedStockItemWhereInput = Prisma.RequestedStockItemWhereInput;

class InventoryRequestsService {

    async fetchRequestedItems({ stockIds, from, to }: {
        stockIds: string[],
        from?: number,
        to?: number,
    }): Promise<Either<RequestedStockItem[], NextResponse>> {
        let whereQuery: RequestedStockItemWhereInput = {
            stockId: {
                in: stockIds
            }
        };

        if (from)
            whereQuery = {
                ...whereQuery,
                createdAt: {
                    gte: new Date(from)
                }
            };

        if (to)
            whereQuery = {
                ...whereQuery,
                createdAt: whereQuery.createdAt && typeof whereQuery.createdAt !== "string" && "gte" in whereQuery.createdAt ? {
                    ...whereQuery.createdAt,
                    lte: new Date(to)
                } : {
                    lte: new Date(to)
                }
            };

        const items = await prisma.requestedStockItem.findMany({
            where: whereQuery
        });

        return new Either<RequestedStockItem[], NextResponse>(items);
    }
}

const inventoryRequestsService = new InventoryRequestsService();
export default inventoryRequestsService;