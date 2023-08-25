"use client";

import { FC, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import {
    StockRequestWithOptionalExtras
} from "../../../_components/requests/inventory-requests-utils";
import Title from "../../../../../../_components/text/Title";
import SubTitle from "../../../../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import { useRouter } from "next/navigation";
import { useUserData } from "../../../../../../../utils/Hooks";
import Permission from "../../../../../../../libs/types/permission";

type Props = {
    id: string,
}

const FetchRequest = (id: string) => {
    return useSWR(`/api/inventory/requests/${id}?with_items=true&with_users=true&with_assignees=true`, fetcher<StockRequestWithOptionalExtras>);
};

const SpecificRequestContainer: FC<Props> = ({ id }) => {
    const { data: userData, isLoading: userDataIsLoading } = useUserData([
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
    const { data: request, isLoading: requestIsLoading, mutate: mutateRequest } = FetchRequest(id);
    const router = useRouter();

    useEffect(() => {
        if (!requestIsLoading && !request)
            router.push("/inventory/requests");
    }, [request, requestIsLoading, router]);

    return (
        <div>
            <Title>Inventory Request</Title>
            <p
                className="text-primary font-semibold text-2xl phone:text-medium default-container p-6 mt-6 w-fit">{requestIsLoading ? "Unknown" : `Request for ${new Date(request?.createdAt ?? "").toLocaleDateString("en-JM")} @ ${new Date(request?.createdAt ?? "").toLocaleTimeString("en-JM", {
                timeZone: "EST",
                timeStyle: "short"
            })}`}</p>
            <Spacer y={12} />
            <div className="default-container max-w-[80%] tablet:w-full p-12 phone:px-4">
                <GoBackButton label="View All Requests" href="/inventory/requests" />
                <Spacer y={6} />
                {JSON.stringify(request)}
            </div>
        </div>
    );
};

export default SpecificRequestContainer;