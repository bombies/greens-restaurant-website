"use client";

import { FC, useEffect, useMemo, useReducer, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalExtras } from "../../../_components/requests/inventory-requests-utils";
import Title from "../../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import { useRouter } from "next/navigation";
import { useUserData } from "../../../../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../../../../libs/types/permission";
import InventoryRequestedItemsTable from "../../../_components/requests/user/form/InventoryRequestedItemsTable";
import {
    ReviewInventoryRequestDto
} from "../../../../../../api/inventory/requests/[id]/review/route";
import { toast } from "react-hot-toast";
import "../../../../../../../utils/GeneralUtils";
import { compare } from "../../../../../../../utils/GeneralUtils";
import ChangesMadeBar from "../../../../employees/[username]/_components/ChangesMadeBar";
import CheckIcon from "../../../../../../_components/icons/CheckIcon";
import GenericModal from "../../../../../../_components/GenericModal";
import GenericTextArea from "../../../../../../_components/inputs/GenericTextArea";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import GenericButton from "../../../../../../_components/inputs/GenericButton";

type Props = {
    id: string,
}

const FetchRequest = (id: string) => {
    return useSWR(`/api/inventory/requests/${id}?with_items=true&with_users=true&with_assignees=true`, fetcher<StockRequestWithOptionalExtras>);
};

enum OptimisticRequestDataActionType {
    SET,
    SET_NOTES,
    REJECT,
    APPROVE,
    PARTIALLY_APPROVE
}

type OptimisticRequestDataPayload = ReviewInventoryRequestDto | { id: string, amountApproved?: number } | {
    notes: string
}
type OptimisticRequestDataAction = {
    type: OptimisticRequestDataActionType,
    payload: OptimisticRequestDataPayload
}

const reducer = (state: ReviewInventoryRequestDto, action: OptimisticRequestDataAction) => {
    let newState = { ...state };
    switch (action.type) {
        case OptimisticRequestDataActionType.SET: {
            newState = { ...action.payload as ReviewInventoryRequestDto };
            break;
        }
        case OptimisticRequestDataActionType.SET_NOTES: {
            const notes = (action.payload as { notes: string }).notes;
            if (!notes) {
                console.warn("Tried setting notes for inventory request with invalid payload!", action.payload);
                break;
            }
            newState.reviewedNotes = notes;
            break;
        }
        case OptimisticRequestDataActionType.APPROVE: {
            const id = (action.payload as { id: string }).id;
            if (!id) {
                console.warn("Tried approving inventory request with invalid payload!", action.payload);
                break;
            }

            const index = newState.items.findIndex(item => item.id === id);
            if (index === -1)
                break;

            const item = newState.items[index];
            newState.items[index] = {
                ...item,
                amountProvided: item.amountRequested
            };
            break;
        }
        case OptimisticRequestDataActionType.PARTIALLY_APPROVE: {
            const { id, amountApproved } = (action.payload as { id: string, amountApproved: number });
            if (!id || !amountApproved) {
                console.warn("Tried approving inventory request with invalid payload!", action.payload);
                break;
            }

            const index = newState.items.findIndex(item => item.id === id);
            if (index === -1)
                break;

            const item = newState.items[index];
            newState.items[index] = {
                ...item,
                amountProvided: amountApproved
            };
            break;
        }
        case OptimisticRequestDataActionType.REJECT: {
            const id = (action.payload as { id: string }).id;
            if (!id) {
                console.warn("Tried rejecting inventory request with invalid payload!", action.payload);
                break;
            }

            const index = newState.items.findIndex(item => item.id === id);
            if (index === -1)
                break;

            const item = newState.items[index];
            newState.items[index] = {
                ...item,
                amountProvided: 0
            };
            break;
        }
    }
    return newState;
};

const SpecificRequestContainer: FC<Props> = ({ id }) => {
    const { data: userData } = useUserData([
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
    const { data: request, isLoading: requestIsLoading, mutate } = FetchRequest(id);
    const [optimisticRequest, dispatchOptimisticRequest] = useReducer(reducer, {
        reviewedNotes: undefined,
        items: []
    });
    const [changesMade, setChangesMade] = useState(false);
    const [confirmReviewModalOpen, setConfirmReviewModalOpen] = useState(false);
    const router = useRouter();

    const startingRequest = useMemo(() => ({
        items: request?.requestedItems?.map(item => ({
            stock: item.stock,
            id: item.id,
            amountRequested: item.amountRequested,
            amountProvided: -1
        })) ?? []
    }), [request?.requestedItems, optimisticRequest]);

    useEffect(() => {
        if (!requestIsLoading && !request)
            router.push("/inventory/requests");
        else if (!requestIsLoading && request) {
            dispatchOptimisticRequest({
                type: OptimisticRequestDataActionType.SET,
                payload: {
                    items: request.requestedItems?.map(item => ({
                        stock: item.stock,
                        id: item.id,
                        amountRequested: item.amountRequested,
                        amountProvided: -1
                    })) ?? []
                }
            });
        }
    }, [request, requestIsLoading, router]);

    useEffect(() => {
        if (requestIsLoading || !request || !optimisticRequest || !startingRequest)
            return;
        setChangesMade(!compare(startingRequest, optimisticRequest));
    }, [startingRequest, optimisticRequest, request, requestIsLoading]);

    console.log(changesMade, startingRequest.items, optimisticRequest.items);
    return (
        <div>
            <GenericModal
                title="Confirm Review"
                isOpen={confirmReviewModalOpen}
                onClose={() => setConfirmReviewModalOpen(false)}
                classNames={{
                    wrapper: "z-[202]",
                    backdrop: "z-[201]"
                }}
            >
                <form>
                    <div className="space-y-6">
                        <GenericTextArea
                            id="review_notes"
                            label="Notes"
                            placeholder="Enter some notes here..."
                        />
                        <Divider className="my-6" />
                        <GenericCard>
                            <p>
                                <span className="font-semibold text-warning">⚠️ Are you sure you want to finish this review? ⚠️</span><br /><br />
                                Once you select <span
                                className="font-semibold text-primary">{"\"I'm sure\""}</span> you will no
                                longer be able to edit this
                                request!
                            </p>

                        </GenericCard>
                        <div className="flex gap-4">
                            <GenericButton
                                type="submit"
                                onPress={() => {
                                    // TODO: Make the API call and mutate the request
                                }}
                            >
                                {"I'm sure"}
                            </GenericButton>
                            <GenericButton
                                color="danger"
                                variant="flat"
                                onPress={() => setConfirmReviewModalOpen(false)}
                            >
                                Nevermind
                            </GenericButton>
                        </div>
                    </div>

                </form>
            </GenericModal>
            <ChangesMadeBar
                changesMade={changesMade}
                isChanging={false}
                onAccept={() => {
                    setConfirmReviewModalOpen(true);
                }}
                onReject={() => {
                    dispatchOptimisticRequest({
                        type: OptimisticRequestDataActionType.SET,
                        payload: { ...startingRequest }
                    });
                }}
                label="You have started reviewing this inventory request!"
                saveButtonConfig={{
                    icon: <CheckIcon />,
                    label: "Finish Review"
                }}
                rejectButtonConfig={{
                    label: "Cancel Review"
                }}
            />
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
                <InventoryRequestedItemsTable
                    items={optimisticRequest.items ?? []}
                    showItemStatus
                    isLoading={requestIsLoading}
                    adminActions={hasAnyPermission(userData?.permissions, [Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY])}
                    onAdminAction={{
                        onApprove(item) {
                            if (!item.id)
                                return;

                            // TODO: Make checks with the current snapshot to ensure item can be approved

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.APPROVE,
                                payload: { id: item.id }
                            });

                            toast.success(`Successfully approved ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        },
                        onPartialApprove(item, amountApproved) {
                            if (!item.id)
                                return;

                            // TODO: Make checks with the current snapshot to ensure item can be partially approved with the amount

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.PARTIALLY_APPROVE,
                                payload: { id: item.id, amountApproved: amountApproved }
                            });

                            toast.success(`Successfully partially approved ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        },
                        onReject(item) {
                            if (!item.id)
                                return;

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.REJECT,
                                payload: { id: item.id }
                            });

                            toast.success(`Successfully rejected ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        }

                    }}
                />
            </div>
        </div>
    );
};

export default SpecificRequestContainer;