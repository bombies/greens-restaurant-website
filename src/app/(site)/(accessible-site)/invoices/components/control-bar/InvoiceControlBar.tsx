"use client";

import CreateInvoiceCustomerButton from "../CreateCustomerButton";
import EditCustomerButton from "../../[id]/components/control-bar/EditCustomerButton";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { Link } from "@nextui-org/react";
import ReportsIcon from "../../../../../_components/icons/ReportsIcon";
import { SearchInvoiceButton } from "./SearchInvoiceButton";

type Props = {
    mutationAllowed?: boolean,
    fetchingAllowed?: boolean,
}

export default function InvoiceControlBar({ mutationAllowed, fetchingAllowed }: Props) {
    return (
        <div className="default-container p-12 gap-6 grid grid-cols-4 tablet:grid-cols-2 phone:grid-cols-1">
            <CreateInvoiceCustomerButton disabled={!mutationAllowed} />
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