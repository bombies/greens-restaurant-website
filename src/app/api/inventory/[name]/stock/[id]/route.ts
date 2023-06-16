import { authenticatedAny, respond } from "../../../../../../utils/api/ApiUtils";
import Permission from "../../../../../../libs/types/permission";
import prisma from "../../../../../../libs/prisma";
import { NextResponse } from "next/server";
import { INVENTORY_NAME_REGEX } from "../../../../../../utils/regex";
import { fetchStockItem, generateValidStockName } from "../../utils";

type RouteContext = {
    params: {
        name: string,
        id: string
    }
}

export function GET(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchedItem = await fetchStockItem(params.name, params.id);
        if (fetchedItem.error)
            return fetchedItem.error;
        return NextResponse.json(fetchedItem.success);
    }, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK, Permission.VIEW_INVENTORY]);
}

type UpdateStockDto = Partial<{
    name: string,
}>

export function PATCH(req: Request, { params }: RouteContext) {
    return authenticatedAny(req, async () => {
        const fetchedItem = await fetchStockItem(params.name, params.id);
        if (fetchedItem.error)
            return fetchedItem.error;

        const item = fetchedItem.success!
        const { name }: UpdateStockDto = await req.json();
        if (!name)
            return respond({
                message: "You provided nothing to update!",
                init: {
                    status: 401
                }
            });

        const validatedName = generateValidStockName(name);
        if (validatedName.error)
            return validatedName.error

        const updatedStock = await prisma.stock.update({
            where: {
                id: item.id
            },
            data: {
                name: name
            }
        });

        return NextResponse.json(updatedStock);
    }, [Permission.MUTATE_STOCK, Permission.CREATE_INVENTORY]);
}