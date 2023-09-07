import TableSkeleton from "../../../../../../_components/skeletons/TableSkeleton";
import { columns } from "../../_components/table/InventoryStockTable";

export default function LoadingPage() {
    return (
        <div className="default-container p-12">
            <TableSkeleton columns={columns} contentRepeat={20} />
        </div>
    );
}