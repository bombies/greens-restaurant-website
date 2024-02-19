import { StockRequestStatus } from "@prisma/client";
import { StockRequestWithOptionalCreator } from "../_components/requests/inventory-requests-utils";

export const getInventoryRequestDisplayDate = (req: StockRequestWithOptionalCreator) =>
    (req.status !== StockRequestStatus.PENDING) ? (req.deliveredAt ?? req.createdAt) : req.createdAt