import { authenticatedAny, respond } from "../../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../../libs/types/permission";
import prisma from "../../../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

type RouteContext = {
    params: {
        name: string,
        id: string
    }
}

type UpdateStockQuantityDto = Partial<{
    quantity: number,
}>

export async function POST(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const inventory = await prisma.inventory.findUnique({
            where: {
                name: params.name
            },
            include: {
                stock: true
            }
        });

        if (!inventory)
            return respond({
                message: `There was no inventory found with the name: ${params.name}`,
                init: {
                    status: 404
                }
            });

        const item = inventory.stock.find(item => item.uid === params.id);
        if (!item)
            return respond({
                message: `There was no stock item found in ${params.name} with id: ${params.id}`,
                init: {
                    status: 404
                }
            });


        const { quantity }: UpdateStockQuantityDto = await req.json();

        if (quantity === undefined)
            return respond({
                message: "You provided nothing to update!",
                init: {
                    status: 401
                }
            });
        else if (quantity < 0)
            return respond({
                message: "The quantity cannot be a negative number!",
                init: {
                    status: 401
                }
            });

        const todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);
        const tommorowsDate = new Date();
        tommorowsDate.setHours(24, 0, 0, 0);

        const existingSnapshot = await prisma.inventorySnapshot.findFirst({
            where: {
                createdAt: {
                    lte: tommorowsDate,
                    gte: todaysDate
                }
            },
            include: {
                stockSnapshots: true
            }
        });

        if (existingSnapshot) {
            // If the snapshot exists, just update it.
            const existingStockSnapshot = existingSnapshot.stockSnapshots.filter(snapshot => snapshot.uid === item.uid)[0];
            if (existingStockSnapshot) {
                // If the snapshot already has a snapshot of the current stock item, update it
                return NextResponse.json(
                    await prisma.stockSnapshot.update({
                        where: {
                            id: existingStockSnapshot.id
                        },
                        data: {
                            quantity: quantity
                        }
                    })
                );
            } else {
                // If not, create the stock item
                return NextResponse.json(
                    await prisma.stockSnapshot.create({
                        data: {
                            uid: item.uid,
                            quantity: quantity,
                            name: item.name,
                            inventorySnapshotId: existingSnapshot.id,
                            inventoryId: inventory.id
                        }
                    })
                );
            }
        } else {
            // If a snapshot doesn't exist, create one then populate it.
            const inventorySnapshot = await prisma.inventorySnapshot.create({
                data: {
                    inventoryId: inventory.id,
                    uid: v4()
                }
            });

            // Check if there is already a snapshot of the current stock item before today.
            const existingStockSnapshot = await prisma.stockSnapshot.findFirst({
                where: {
                    uid: item.uid,
                    createdAt: {
                        lt: todaysDate
                    }
                }
            });

            // If an existing snapshot exists, re-create it so that a snapshot for today's date is created.
            if (existingStockSnapshot) {
                return NextResponse.json(
                    await prisma.stockSnapshot.create({
                        data: {
                            name: item.name,
                            uid: item.uid,
                            quantity: existingStockSnapshot.quantity,
                            inventorySnapshotId: inventorySnapshot.id,
                            inventoryId: inventory.id
                        }
                    })
                );
            } else {
                // If not, create a new snapshot with the current quantity.
                return NextResponse.json(
                    await prisma.stockSnapshot.create({
                        data: {
                            name: item.name,
                            uid: item.uid,
                            quantity: quantity,
                            inventorySnapshotId: inventorySnapshot.id,
                            inventoryId: inventory.id
                        }
                    })
                );
            }
        }
    }, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK]);
}