"use client";

import CreateInvoiceCustomerButton from "./CreateCustomerButton";
import EditCustomerButton from "../[id]/components/control-bar/EditCustomerButton";
import GenericButton from "../../../../_components/inputs/GenericButton";
import { Link } from "@nextui-org/react";
import ReportsIcon from "../../../../_components/icons/ReportsIcon";

type Props = {
    controlsEnabled?: boolean
}

export default function InvoiceControlBar({ controlsEnabled }: Props) {
    return (
        <div className="default-container p-12 gap-6 flex">
            <CreateInvoiceCustomerButton disabled={!controlsEnabled} />
            <GenericButton
                as={Link}
                color="warning"
                href="/invoices/reports"
                startContent={<ReportsIcon fill="#ffa700" />}
                variant="flat"
            >
                Reports
            </GenericButton>
        </div>
    );
}