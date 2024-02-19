"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useReducer } from "react";
import { StockRequestWithOptionalExtras } from "../../../../_components/requests/inventory-requests-utils";
import { compare } from "../../../../../../../../utils/GeneralUtils";
import { ReviewInventoryRequestDto } from "../../../../../../../api/inventory/requests/types";

export enum OptimisticRequestDataActionType {
    /**
     * Internal use ONLY. To reset reducer data
     * use the function provided.
     */
    RESET,
    /**
     * INTENDED FOR USE ONLY WHEN THE REQUEST IS LOADED.
     * NOT TO BE USED FOR ANY OTHER CIRCUMSTANCE.
     */
    SET,
    SET_NOTES,
    SET_DELIVERED_AT,
    REJECT,
    APPROVE,
    PARTIALLY_APPROVE
}

type OptimisticRequestDataAction = {
    type: OptimisticRequestDataActionType.SET,
    payload: ReviewInventoryRequestDto
} | {
    type: OptimisticRequestDataActionType.SET_NOTES,
    payload: { notes: string }
} | {
    type: OptimisticRequestDataActionType.REJECT | OptimisticRequestDataActionType.APPROVE,
    payload: { id: string }
} | {
    type: OptimisticRequestDataActionType.PARTIALLY_APPROVE,
    payload: { id: string, amountApproved: number }
} | {
    type: OptimisticRequestDataActionType.RESET
    payload: StockRequestWithOptionalExtras
} | {
    type: OptimisticRequestDataActionType.SET_DELIVERED_AT,
    payload: { deliveredAt: Date }
}

const reducer = (state: ReviewInventoryRequestDto, action: OptimisticRequestDataAction) => {
    let newState = { ...state };
    switch (action.type) {
        case OptimisticRequestDataActionType.RESET: {
            newState = {
                deliveredAt: new Date().toISOString(),
                items: action.payload.requestedItems?.map(item => ({
                    stock: item.stock,
                    id: item.id,
                    amountRequested: item.amountRequested,
                    amountProvided: item.amountProvided ?? -1,
                })) ?? []
            };
            break;
        }
        case OptimisticRequestDataActionType.SET: {
            newState = { ...action.payload };
            break;
        }
        case OptimisticRequestDataActionType.SET_NOTES: {
            const notes = action.payload.notes;
            if (!notes) {
                console.warn("Tried setting notes for inventory request with invalid payload!", action.payload);
                break;
            }
            newState.reviewedNotes = notes;
            break;
        }
        case OptimisticRequestDataActionType.SET_DELIVERED_AT: {
            const deliveredAt = action.payload.deliveredAt;
            if (!deliveredAt) {
                console.warn("Tried setting deliveredAt for inventory request with invalid payload!", action.payload);
                break;
            }
            newState.deliveredAt = deliveredAt.toISOString();
            break;
        }
        case OptimisticRequestDataActionType.APPROVE: {
            const id = action.payload.id;
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
            const { id, amountApproved } = action.payload;
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
            const id = action.payload.id;
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
    setChangesMade: Dispatch<SetStateAction<boolean>>
}

const useAdminInventoryRequestData = ({ isEnabled, request, requestIsLoading, setChangesMade }: Args) => {
    const [optimisticRequest, dispatchOptimisticRequest] = useReducer(reducer, {
        reviewedNotes: undefined,
        items: [],
        deliveredAt: new Date().toISOString()
    });

    useEffect(() => {
        if (!requestIsLoading && request)
            dispatchOptimisticRequest({
                type: OptimisticRequestDataActionType.SET,
                payload: {
                    items: request.requestedItems?.map(item => ({
                        stock: item.stock,
                        id: item.id,
                        amountRequested: item.amountRequested,
                        amountProvided: item.amountProvided ?? -1
                    })) ?? [],
                    deliveredAt: request.deliveredAt ? new Date(request.deliveredAt).toISOString() : new Date().toISOString()
                }
            });
    }, [request, request?.requestedItems, requestIsLoading]);

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
                    })) ?? [],
                    deliveredAt: request.deliveredAt ? new Date(request.deliveredAt).toISOString() : new Date().toISOString()
                }
            });
        }
    }, [isEnabled, request, requestIsLoading]);

    useEffect(() => {
        if (!isEnabled || requestIsLoading || !request || !optimisticRequest)
            return;

        const initialRequestItems = ({
            items: request.requestedItems?.map(item => ({
                stock: item.stock,
                id: item.id,
                amountRequested: item.amountRequested,
                amountProvided: item.amountProvided ?? -1
            })) ?? []
        });

        setChangesMade(!compare(optimisticRequest, initialRequestItems));
    }, [optimisticRequest, request, requestIsLoading, setChangesMade, isEnabled]);

    const resetOptimisticData = useCallback(() => {
        if (!request)
            return;

        dispatchOptimisticRequest({
            type: OptimisticRequestDataActionType.RESET,
            payload: request
        });
    }, [request])

    return { optimisticRequest, dispatchOptimisticRequest, resetOptimisticData };
};

export default useAdminInventoryRequestData;