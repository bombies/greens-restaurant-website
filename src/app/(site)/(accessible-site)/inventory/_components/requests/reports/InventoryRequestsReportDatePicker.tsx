"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { InventoryRequestsReportActions, RequestedStockItemWithExtrasAndRequestExtras, useInventoryRequestsReport } from "./InventoryRequestsReportProvider";
import { GenericDatePicker } from "../../../../../../_components/GenericDatePicker";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import { SearchIcon } from "@nextui-org/shared-icons";
import { SubmitHandler, useForm } from "react-hook-form";
import { dateInputToDateObject } from "../../../../../../../utils/GeneralUtils";
import useSWRMutation from "swr/mutation";
import { $getWithArgs, handleAxiosError } from "../../../../../../../utils/swr-utils";
import { StockRequestWithOptionalExtras } from "../inventory-requests-utils";

const FetchRequests = () =>
    useSWRMutation(`/api/inventory/requests`, $getWithArgs<{
        from?: string,
        to?: string,
        with_items?: string,
        with_users?: string,
        with_assignees?: string,
        status?: string,
        with_stock?: string,
        with_reviewer?: string,
        with_location?: string,
    }, StockRequestWithOptionalExtras[]>());

type FormProps = {
    start_date?: string,
    end_date?: string
}

const InventoryRequestsReportDatePicker: FC = () => {
    const [
        { data: { visibleData }, table: { sortDescriptor } },
        dispatch
    ] = useInventoryRequestsReport();
    const { trigger: doFetch, isMutating: isFetching } = FetchRequests();
    const { register, handleSubmit } = useForm<FormProps>();
    const [currentStartDate, setCurrentStartDate] = useState<Date>();
    const [currentEndDate, setCurrentEndDate] = useState<Date>();

    useEffect(() => {
        dispatch({
            type: InventoryRequestsReportActions.UPDATE_DATA,
            payload: { isFetching }
        });
    }, [dispatch, isFetching]);

    useEffect(() => {
        if (!visibleData || !visibleData.length)
            return

        return dispatch({
            type: InventoryRequestsReportActions.UPDATE_DATA,
            payload: {
                visibleData: visibleData.sort((a, b) => {
                    if (!sortDescriptor)
                        return 0

                    let cmp: number
                    switch (sortDescriptor.column) {
                        case "date_requested":
                            cmp = new Date(a.deliveredAt ?? a.createdAt).getTime() - new Date(b.deliveredAt ?? b.createdAt).getTime();
                            break;
                        default:
                            cmp = 0;
                            break;
                    }

                    if (sortDescriptor.direction === "descending")
                        cmp *= -1;

                    return cmp
                })
            }
        });
    }, [dispatch, sortDescriptor, visibleData])

    const onSubmit = useCallback<SubmitHandler<FormProps>>(({ start_date, end_date }) => {
        const startDate = dateInputToDateObject(start_date);
        const endDate = dateInputToDateObject(end_date);

        startDate?.setHours(0, 0, 0, 0);
        endDate?.setHours(23, 59, 59, 999);

        dispatch({
            type: InventoryRequestsReportActions.UPDATE_QUERY,
            payload: {
                startDate: startDate,
                endDate: endDate
            }
        });

        doFetch({
            body: {
                from: startDate?.getTime().toString(),
                to: endDate?.getTime().toString(),
                with_items: "true",
                with_users: "true",
                with_assignees: "true",
                with_stock: "true",
                with_reviewer: "true",
                with_location: "true"
            }
        }).then(requests => {
            const items = (requests ?? []).map(request =>
                (request.requestedItems ?? [])
                    .map<RequestedStockItemWithExtrasAndRequestExtras>(requestedItem => ({
                        ...requestedItem,
                        assignedLocation: request.assignedLocation,
                        requestedBy: request.requestedByUser,
                        assignedTo: request.assignedToUsers,
                        reviewedBy: request.reviewedByUser,
                        deliveredAt: request.deliveredAt
                    }))
            )
                .flat(2)

            dispatch({
                type: InventoryRequestsReportActions.UPDATE_DATA,
                payload: { data: items ?? [], visibleData: items ?? [] }
            });
        }).catch(handleAxiosError);
    }, [dispatch, doFetch]);

    return (
        <form
            className="grid place-content-center grid-cols-3 default-container p-6 tablet:grid-cols-1 gap-4"
            onSubmit={handleSubmit(onSubmit)}
        >
            <GenericDatePicker
                isDisabled={isFetching}
                register={register}
                id="start_date"
                label="Start Date"
                labelPlacement="above"
                onDateChange={setCurrentStartDate}
                max={currentEndDate}
            />
            <GenericDatePicker
                isDisabled={isFetching}
                register={register}
                id="end_date"
                label="End Date"
                labelPlacement="above"
                onDateChange={setCurrentEndDate}
                min={currentStartDate}
            />
            <GenericButton
                disabled={isFetching}
                isLoading={isFetching}
                type="submit"
                variant="flat"
                className="self-end h-20"
                startContent={<SearchIcon />}
            >
                Search
            </GenericButton>
        </form>
    );
};

export default InventoryRequestsReportDatePicker;