import { FC } from "react";
import GenericTable from "../../../../../../_components/table/GenericTable";
import { InvoiceWithExtras } from "../../../../../../api/invoices/types";
import useInvoicesTableAttributes from "./useInvoicesTableAttributes";
import { TableCell, TableRow } from "@nextui-org/react";

type Props = {
    invoices?: InvoiceWithExtras[],
    isLoading: boolean
}

const AllInvoicesTable: FC<Props> = ({ invoices, isLoading }) => {
    const {
        visibleItems,
        sortDescriptor,
        setSortDescriptor,
        columns,
        getKeyValue
    } = useInvoicesTableAttributes({ invoices });

    return (
        <GenericTable
            columns={columns}
            items={visibleItems ?? []}
            sortDescriptor={sortDescriptor}
            isLoading={isLoading}
            emptyContent={"There are no invoices..."}
            onSortChange={setSortDescriptor}
            sortableColumns={["invoice_number", "invoice_customer", "invoice_total", "total_paid", "total_outstanding"]}
        >
            {item => (
                <TableRow key={item.id}>
                    {(col) => <TableCell>{getKeyValue(col, item)}</TableCell>}
                </TableRow>
            )}
        </GenericTable>
    );
};

export default AllInvoicesTable;