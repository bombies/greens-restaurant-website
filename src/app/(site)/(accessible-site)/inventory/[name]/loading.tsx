import TableSkeleton from "@/app/_components/skeletons/TableSkeleton";
import { inventoryColumns } from "./_components/table/InventoryStockTable";

export default function Loading() {
    return (
        <div className="default-container p-12 tablet:px-2">
            <TableSkeleton
                columns={inventoryColumns}
                contentRepeat={10}
            />
        </div>
    )
}