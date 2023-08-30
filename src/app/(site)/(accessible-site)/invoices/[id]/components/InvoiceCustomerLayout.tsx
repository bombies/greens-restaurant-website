"use client";

import Title from "../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import InvoiceCustomerControlBar from "./control-bar/InvoiceCustomerControlBar";
import { useUserData } from "../../../../../../utils/Hooks";
import { Fragment } from "react";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import InvoiceGrid from "./InvoiceGrid";
import { InvoiceCustomerInformation } from "./InvoiceCustomerInformation";
import { FetchInvoiceCustomer } from "../../utils/invoice-client-utils";

type Props = {
    id: string,
}

export default function InvoiceCustomerLayout({ id }: Props) {
    const { data: customer, isLoading: customerIsLoading, mutate } = FetchInvoiceCustomer(id, true, true);
    const { data: userData } = useUserData([
        Permission.VIEW_INVOICES,
        Permission.CREATE_INVOICE
    ]);

    return (
        <div>
            <div className="flex tablet:flex-col gap-12 tablet:gap-6">
                <Title className="self-center">Invoices - <span
                    className="text-primary capitalize">{customerIsLoading ? "Unknown" : customer?.customerName}</span>
                </Title>
                <InvoiceCustomerInformation id={id} />
            </div>
            <Spacer y={6} />
            {
                hasAnyPermission(
                    userData?.permissions,
                    [Permission.CREATE_INVOICE]
                )
                &&
                <Fragment>
                    <InvoiceCustomerControlBar
                        customer={customer}
                        mutator={mutate}
                        controlsEnabled={
                            hasAnyPermission(
                                userData?.permissions,
                                [Permission.CREATE_INVOICE]
                            )}
                    />
                    <Spacer y={6} />
                </Fragment>
            }
            <InvoiceGrid
                customerIsLoading={customerIsLoading}
                customer={customer}
            />
        </div>
    );
}