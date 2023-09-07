"use client";

import { InvoiceWithExtras } from "../../../../../../api/invoices/types";
import { Key, useCallback, useMemo, useState } from "react";
import { Link, SortDescriptor } from "@nextui-org/react";
import { formatInvoiceNumber, generateInvoiceTotal } from "../../../utils/invoice-utils";
import { Column } from "../../../[id]/[invoiceId]/components/table/InvoiceTable";
import { dollarFormat } from "../../../../../../../utils/GeneralUtils";
import IconButton from "../../../../../../_components/inputs/IconButton";
import EyeIcon from "../../../../../../_components/icons/EyeIcon";

type Props = {
    invoices?: InvoiceWithExtras[]
}

const useInvoicesTableAttributes = ({ invoices }: Props) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

    const sortedItems = useMemo(() => invoices?.sort((a, b) => {
        if (!sortDescriptor)
            return 0;

        let cmp: number;
        const aTotal = generateInvoiceTotal(a);
        const bTotal = generateInvoiceTotal(b);

        switch (sortDescriptor?.column) {
            case "invoice_number": {
                cmp = a.number - b.number;
                break;
            }
            case "invoice_total": {
                cmp = aTotal - bTotal;
                break;
            }
            case "total_paid": {
                cmp = (a.paid ? aTotal : 0) - (b.paid ? bTotal : 0);
                break;
            }
            case "total_outstanding": {
                cmp = (a.paid ? 0 : aTotal) - (b.paid ? 0 : bTotal);
                break;
            }
            case "invoice_customer": {
                cmp = a.customer.customerName.localeCompare(b.customer.customerName);
                break;
            }
            default: {
                cmp = 0;
                break;
            }
        }

        cmp *= sortDescriptor?.direction === "descending" ? -1 : 1;
        return cmp;
    }) ?? [], [invoices, sortDescriptor]);

    const columns = useMemo<Column[]>(() => ([
        {
            key: "invoice_number",
            value: "Number"
        },
        {
            key: "invoice_customer",
            value: "Customer"
        },
        {
            key: "invoice_desc",
            value: "Description"
        },
        {
            key: "invoice_total",
            value: "Total"
        },
        {
            key: "total_paid",
            value: "Total Paid"
        },
        {
            key: "total_outstanding",
            value: "Total Outstanding"
        },
        {
            key: "actions",
            value: "Actions"
        }
    ]), []);

    const getKeyValue = useCallback((key: Key, item: InvoiceWithExtras) => {
        const invoiceTotal = generateInvoiceTotal(item);

        switch (key) {
            case "invoice_number": {
                return formatInvoiceNumber(item.number);
            }
            case "invoice_customer": {
                return item.customer.customerName;
            }
            case "invoice_desc": {
                return item.description;
            }
            case "invoice_total": {
                return dollarFormat.format(generateInvoiceTotal(item));
            }
            case "total_paid": {
                return dollarFormat.format(item.paid ? invoiceTotal : 0);
            }
            case "total_outstanding": {
                return dollarFormat.format(item.paid ? 0 : invoiceTotal);
            }
            case "actions": {
                return (
                    <div className="flex gap-4">
                        <IconButton
                            variant="flat"
                            color="primary"
                            toolTip="View"
                            as={Link}
                            href={`/invoices/${item.customerId}/${item.id}`}
                        >
                            <EyeIcon width={16} />
                        </IconButton>
                    </div>
                );
            }
        }
    }, []);

    return { visibleItems: sortedItems, sortDescriptor, setSortDescriptor, columns, getKeyValue };
};

export default useInvoicesTableAttributes;