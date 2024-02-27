import TableSkeleton from "../../../../../../_components/skeletons/TableSkeleton";
import { inventoryColumns } from "../../_components/table/InventoryStockTable";

export default function LoadingPage() {
    return (
        <div className="default-container p-12">
            <TableSkeleton columns={inventoryColumns} contentRepeat={20} />
        </div>
    );
}