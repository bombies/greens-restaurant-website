"use client";

import { FC, Fragment } from "react";
import useAllInvoices from "../hooks/useAllInvoices";
import AllInvoicesTable from "./table/AllInvoicesTable";

const AllInvoicesTab: FC = () => {
    const { data: invoices, isLoading: invoicesLoading } = useAllInvoices();

    return (
        <Fragment>
            <AllInvoicesTable isLoading={invoicesLoading} invoices={invoices} />
        </Fragment>
    );
};

export default AllInvoicesTab;