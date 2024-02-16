"use client";

import { FC, useEffect } from "react";
import SubTitle from "../../../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import { InventoryRequestsReportActions, useInventoryRequestsReport } from "./InventoryRequestsReportProvider";
import CheckboxMenu from "../../../../../../_components/CheckboxMenu";
import FilterIcon from "../../../../../../_components/icons/FilterIcon";
import { Checkbox } from "@nextui-org/react";
import { StockRequestStatus } from ".prisma/client";
import UserAvatar from "../../../../../../_components/UserAvatar";
import { getStatusChip } from "../../hooks/useRequestStatus";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import { toast } from "react-hot-toast";
import DeniedIcon from "../../../../../../_components/icons/DeniedIcon";

const InventoryRequestsReportFilters: FC = () => {
    const [{
        data: { data: allRequests },
        filters: {
            status,
            requestedBy,
            items,
            reviewedBy,
            assignedTo,
            locations,
        }
    }, dispatch] = useInventoryRequestsReport();

    useEffect(() => {
        dispatch({
            type: InventoryRequestsReportActions.UPDATE_DATA,
            payload: {
                visibleData: allRequests.filter(item => {
                    const reqStatus = item.amountProvided === null ? StockRequestStatus.PENDING : (
                        item.amountProvided === item.amountRequested ? StockRequestStatus.DELIVERED : (
                            item.amountProvided > 0 && item.amountProvided < item.amountRequested ? StockRequestStatus.PARTIALLY_DELIVERED : (
                                item.amountProvided > item.amountRequested ? "EXTRA_DELIVERED" : StockRequestStatus.REJECTED
                            )
                        )
                    );

                    const statusFilter = !status || !status.length ? true : status?.includes(reqStatus);
                    const requestedByFilter = !requestedBy || !requestedBy.length ? true : requestedBy.includes(item.requestedBy?.id ?? "");
                    const itemsFilter = !items || !items.length ? true : items?.includes(item.stockId);
                    const reviewedByFilter = !reviewedBy || !reviewedBy.length ? true : reviewedBy?.includes(item.reviewedBy?.id ?? "");
                    const assignedToFilter = !assignedTo || !assignedTo.length ? true : assignedTo?.some(assignedTo => item.assignedTo?.map(it => it.id).includes(assignedTo));
                    const locationsFilter = !locations || !locations.length ? true : locations?.includes(item.assignedLocation?.id ?? "");

                    return statusFilter && requestedByFilter && itemsFilter && reviewedByFilter && assignedToFilter && locationsFilter;
                })
            }
        });
    }, [allRequests, assignedTo, dispatch, items, requestedBy, reviewedBy, status]);

    return (
        <div className="p-6 bg-primary/20 rounded-2xl">
            <div className="flex gap-4">
                <SubTitle className="self-center">Filters</SubTitle>
                <GenericButton
                    isDisabled={!status?.length && !requestedBy?.length && !items?.length && !reviewedBy?.length && !assignedTo?.length}
                    color="warning"
                    size="sm"
                    variant="flat"
                    startContent={<DeniedIcon width={16} />}
                    onPress={() => {
                        dispatch({
                            type: InventoryRequestsReportActions.UPDATE_FILTERS,
                            payload: {
                                status: [],
                                requestedBy: [],
                                items: [],
                                reviewedBy: [],
                                assignedTo: []
                            }
                        });
                        toast.success("Cleared filters!");
                    }}
                >Clear Filters</GenericButton>
            </div>
            <Divider className="my-6" />
            <div className="grid grid-cols-3 phone:grid-cols-1 gap-4">
                <CheckboxMenu
                    buttonProps={{
                        fullWidth: true,
                        isIconOnly: false,
                        children: (
                            <>
                                <FilterIcon /> Status
                            </>
                        )
                    }}
                    checkboxGroupProps={{
                        label: "Status",
                        value: status ?? [],
                        onValueChange: (value) => {
                            dispatch({
                                type: InventoryRequestsReportActions.UPDATE_FILTERS,
                                payload: {
                                    status: value as StockRequestStatus[]
                                }
                            });
                        }
                    }}
                >
                    <Checkbox
                        value={"EXTRA_DELIVERED"}>{getStatusChip("EXTRA_DELIVERED")}</Checkbox>
                    <Checkbox
                        value={StockRequestStatus.DELIVERED}>{getStatusChip(StockRequestStatus.DELIVERED)}</Checkbox>
                    <Checkbox
                        value={StockRequestStatus.PARTIALLY_DELIVERED}>{getStatusChip(StockRequestStatus.PARTIALLY_DELIVERED)}</Checkbox>
                    <Checkbox
                        value={StockRequestStatus.REJECTED}>{getStatusChip(StockRequestStatus.REJECTED)}</Checkbox>
                    <Checkbox value={StockRequestStatus.PENDING}>{getStatusChip(StockRequestStatus.PENDING)}</Checkbox>
                </CheckboxMenu>
                <CheckboxMenu
                    buttonProps={{
                        fullWidth: true,
                        isIconOnly: false,
                        children: (
                            <>
                                <FilterIcon /> Locations
                            </>
                        )
                    }}
                    checkboxGroupProps={{
                        label: "Locations",
                        value: locations ?? [],
                        onValueChange: (value) => {
                            dispatch({
                                type: InventoryRequestsReportActions.UPDATE_FILTERS,
                                payload: {
                                    locations: value
                                }
                            });
                        }
                    }}
                >
                    {
                        allRequests.map(request => request.assignedLocation)
                            .filter((item, index, array) => array.findIndex(it => it?.id === item?.id) === index)
                            .filter(item => item)
                            .map(location => (
                                <Checkbox key={location!.id} value={location!.id}>
                                    <span className="capitalize">{location!.name.replaceAll("-", " ")}</span>
                                </Checkbox>
                            ))
                    }
                </CheckboxMenu>
                <CheckboxMenu
                    buttonProps={{
                        fullWidth: true,
                        isIconOnly: false,
                        children: (
                            <>
                                <FilterIcon /> Requested By
                            </>
                        )
                    }}
                    checkboxGroupProps={{
                        label: "Requested By",
                        value: requestedBy ?? [],
                        onValueChange: (value) => {
                            dispatch({
                                type: InventoryRequestsReportActions.UPDATE_FILTERS,
                                payload: {
                                    requestedBy: value
                                }
                            });
                        }
                    }}
                >
                    {
                        allRequests.map(request => request.requestedBy)
                            .flat(2)
                            .filter((item, index, array) => array.findIndex(it => it?.id === item?.id) === index)
                            .filter(item => item)
                            .map(user => (
                                <Checkbox key={user!.id} value={user!.id}>
                                    <span className="flex gap-2">
                                        <UserAvatar user={user!} size="sm" />
                                        <span
                                            className="capitalize self-center">{user!.firstName.toLowerCase()} {user!.lastName.toLowerCase()}</span>
                                    </span>
                                </Checkbox>
                            ))
                    }
                </CheckboxMenu>
                <CheckboxMenu
                    buttonProps={{
                        fullWidth: true,
                        isIconOnly: false,
                        children: (
                            <>
                                <FilterIcon /> Assigned To
                            </>
                        )
                    }}
                    checkboxGroupProps={{
                        label: "Assigned To",
                        value: assignedTo ?? [],
                        onValueChange: (value) => {
                            dispatch({
                                type: InventoryRequestsReportActions.UPDATE_FILTERS,
                                payload: {
                                    assignedTo: value
                                }
                            });
                        }
                    }}
                >
                    {
                        allRequests.map(request => request.assignedTo)
                            .flat(2)
                            .filter((item, index, array) => array.findIndex(it => it?.id === item?.id) === index)
                            .filter(item => item)
                            .map(user => (
                                <Checkbox key={user!.id} value={user!.id}>
                                    <span className="flex gap-2">
                                        <UserAvatar user={user!} size="sm" />
                                        <span
                                            className="capitalize self-center">{user!.firstName.toLowerCase()} {user!.lastName.toLowerCase()}</span>
                                    </span>
                                </Checkbox>
                            ))
                    }
                </CheckboxMenu>
                <CheckboxMenu
                    buttonProps={{
                        fullWidth: true,
                        isIconOnly: false,
                        children: (
                            <>
                                <FilterIcon /> Reviewed By
                            </>
                        )
                    }}
                    checkboxGroupProps={{
                        label: "Reviewed By",
                        value: reviewedBy ?? [],
                        onValueChange: (value) => {
                            dispatch({
                                type: InventoryRequestsReportActions.UPDATE_FILTERS,
                                payload: {
                                    reviewedBy: value
                                }
                            });
                        }
                    }}
                >
                    {
                        allRequests.map(request => request.reviewedBy)
                            .flat(2)
                            .filter((item, index, array) => array.findIndex(it => it?.id === item?.id) === index)
                            .filter(item => item)
                            .map(user => (
                                <Checkbox key={user!.id} value={user!.id}>
                                    <span className="flex gap-2">
                                        <UserAvatar user={user!} size="sm" />
                                        <span
                                            className="capitalize self-center">{user!.firstName.toLowerCase()} {user!.lastName.toLowerCase()}</span>
                                    </span>
                                </Checkbox>
                            ))
                    }
                </CheckboxMenu>
                <CheckboxMenu
                    maxHeight="24rem"
                    buttonProps={{
                        fullWidth: true,
                        isIconOnly: false,
                        children: (
                            <>
                                <FilterIcon /> Items
                            </>
                        )
                    }}
                    checkboxGroupProps={{
                        label: "Items",
                        value: items ?? [],
                        onValueChange: (value) => {
                            dispatch({
                                type: InventoryRequestsReportActions.UPDATE_FILTERS,
                                payload: {
                                    items: value
                                }
                            });
                        }
                    }}
                >
                    {
                        allRequests
                            .filter((item, index, array) => array.findIndex(it => it.stockId === item.stockId) === index)
                            .map(req => (
                                <Checkbox key={req.stockId} value={req.stockId}>
                                    <span className="capitalize">{req.stock?.name.replaceAll("-", " ")}</span>
                                </Checkbox>
                            ))
                    }
                </CheckboxMenu>
            </div>
        </div>
    );
};

export default InventoryRequestsReportFilters;