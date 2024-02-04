import { FC } from "react";
import GenericTable from "../../../../../../_components/table/GenericTable";
import { InvoiceWithExtras } from "../../../../../../api/invoices/types";
import useInvoicesTableAttributes from "./useInvoicesTableAttributes";
import { Checkbox, Spacer, TableCell, TableRow } from "@nextui-org/react";
import CheckboxMenu from "../../../../../../_components/CheckboxMenu";
import FilterIcon from "../../../../../../_components/icons/FilterIcon";
import { InvoiceType } from "@prisma/client";

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
        getKeyValue,
        currentTypeFilter,
        setCurrentTypeFilter
    } = useInvoicesTableAttributes({ invoices });

    return (
        <>
            <CheckboxMenu
                buttonProps={{
                    isIconOnly: false,
                    children: (
                        <>
                            <FilterIcon /> Type
                        </>
                    )
                }}
                checkboxGroupProps={{
                    label: "Status",
                    value: currentTypeFilter ?? [],
                    onValueChange: (value) => {
                        setCurrentTypeFilter(value as InvoiceType[]);
                    }
                }}
            >
                <Checkbox value={InvoiceType.DEFAULT}>Invoice</Checkbox>
                <Checkbox value={InvoiceType.QUOTE}>Quote</Checkbox>
                {/*<Checkbox value={InvoiceType.CASH_RECEIPT}>Cash Receipt</Checkbox>*/}
            </CheckboxMenu>
            <Spacer  y={6} />
            <GenericTable
                columns={columns}
                items={visibleItems ?? []}
                sortDescriptor={sortDescriptor}
                isLoading={isLoading}
                emptyContent={"There are no documents..."}
                onSortChange={setSortDescriptor}
                sortableColumns={["invoice_number", "invoice_customer", "invoice_total", "total_paid", "total_outstanding"]}
            >
                {item => (
                    <TableRow key={item.id}>
                        {(col) => <TableCell>{getKeyValue(col, item)}</TableCell>}
                    </TableRow>
                )}
            </GenericTable>
        </>

    );
};

export default AllInvoicesTable;