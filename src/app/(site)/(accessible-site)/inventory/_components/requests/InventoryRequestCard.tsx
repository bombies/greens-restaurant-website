"use client";

import { FC } from "react";
import LinkCard from "../../../../../_components/LinkCard";
import { StockRequest } from "@prisma/client";
import { Divider } from "@nextui-org/divider";

interface Props {
    request: StockRequest;
}

const InventoryRequestCard: FC<Props> = ({ request }) => {
    return (
        <LinkCard href={`/inventory/requests/${request.id}`}>
            {new Date(request.createdAt).toDateString()}
            <Divider />

        </LinkCard>
    );
};

export default InventoryRequestCard;