import { StockRequestStatus } from ".prisma/client";

class SelfUserService {
    constructor() {
    }

    getFetchStockRequestsSearchParams(url: string) {
        const { searchParams } = new URL(url);
        const status = searchParams.get("status")?.toLowerCase() as StockRequestStatus;
        const withItems = searchParams.get("with_items")?.toLowerCase() === "true" || false;
        const withUsers = searchParams.get("with_users")?.toLowerCase() === "true" || false;
        const withAssignees = searchParams.get("with_assignees")?.toLowerCase() === "true" || false;
        const from: number | undefined = searchParams.get("from") ? Number(searchParams.get("from")) : undefined;
        const to: number | undefined = searchParams.get("to") ? Number(searchParams.get("to")) : undefined;
        return { status, withItems, withUsers, withAssignees, from, to };
    };

}

const selfUserService = new SelfUserService()
export default selfUserService