"use client";

import CreateInvoiceCustomerButton from "../CreateCustomerButton";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { Link } from "@nextui-org/react";
import ReportsIcon from "../../../../../_components/icons/ReportsIcon";
import { SearchInvoiceButton } from "./SearchInvoiceButton";
import { InvoiceCustomerWithOptionalItems } from "../../../home/_components/widgets/invoice/InvoiceWidget";
import { KeyedMutator } from "swr";

type Props = {
    mutationAllowed?: boolean,
    fetchingAllowed?: boolean,
    mutateData: KeyedMutator<InvoiceCustomerWithOptionalItems[] | undefined>,
    customers?: InvoiceCustomerWithOptionalItems[]
}

export default function InvoiceControlBar({ mutationAllowed, fetchingAllowed, mutateData, customers }: Props) {
    return (
        <div className="default-container p-6 gap-6 grid grid-cols-4 tablet:grid-cols-2 phone:grid-cols-1">
            <CreateInvoiceCustomerButton
                disabled={!mutationAllowed}
                mutateData={mutateData}
                customers={customers}
            />
            <GenericButton
                as={Link}
                disabled={!fetchingAllowed}
                color="warning"
                href="/invoices/reports"
                startContent={<ReportsIcon fill="#ffa700" />}
                variant="flat"
            >
                Reports
            </GenericButton>
            <SearchInvoiceButton
                disabled={!fetchingAllowed}
            />
        </div>
    );
}