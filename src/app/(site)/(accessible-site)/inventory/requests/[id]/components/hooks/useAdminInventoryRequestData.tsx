"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useReducer } from "react";
import { StockRequestWithOptionalExtras } from "../../../../_components/requests/inventory-requests-utils";
import { compare } from "../../../../../../../../utils/GeneralUtils";
import { ReviewInventoryRequestDto } from "../../../../../../../api/inventory/requests/types";

export enum OptimisticRequestDataActionType {
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

type Args = {
    isEnabled: boolean,
    request?: StockRequestWithOptionalExtras,
    requestIsLoading: boolean,
    changesMade: boolean,
    setChangesMade: Dispatch<SetStateAction<boolean>>
}

const useAdminInventoryRequestData = ({ isEnabled, request, requestIsLoading, changesMade, setChangesMade }: Args) => {
    const [optimisticRequest, dispatchOptimisticRequest] = useReducer(reducer, {
        reviewedNotes: undefined,
        items: []
    });

    const startingRequest = useMemo(() => ({
        items: request?.requestedItems?.map(item => ({
            stock: item.stock,
            id: item.id,
            amountRequested: item.amountRequested,
            amountProvided: item.amountProvided ?? -1
        })) ?? []
    }), [request?.requestedItems, optimisticRequest]);

    useEffect(() => {
        if (!isEnabled)
            return;

        if (!requestIsLoading && request) {
            dispatchOptimisticRequest({
                type: OptimisticRequestDataActionType.SET,
                payload: {
                    items: request.requestedItems?.map(item => ({
                        stock: item.stock,
                        id: item.id,
                        amountRequested: item.amountRequested,
                        amountProvided: item.amountProvided ?? -1
                    })) ?? []
                }
            });
        }
    }, [isEnabled, request, requestIsLoading]);

    useEffect(() => {
        if (!isEnabled || requestIsLoading || !request || !optimisticRequest || !startingRequest)
            return;
        setChangesMade(!compare(startingRequest, optimisticRequest));
    }, [startingRequest, optimisticRequest, request, requestIsLoading, setChangesMade, isEnabled]);

    return { optimisticRequest, dispatchOptimisticRequest, startingRequest };
};

export default useAdminInventoryRequestData;