"use client";

import { createGenericContext, UseReducerArray } from "../../../../../../../utils/context-utils";
import { StockRequestStatus } from ".prisma/client";
import { FC, PropsWithChildren, useReducer } from "react";
import { StockRequestWithOptionalExtras } from "../inventory-requests-utils";
import { RequestedStockItemWithOptionalExtras } from "../../../../../../api/inventory/requests/types";
import { SortDescriptor } from "@nextui-org/react";

type InventoryRequestsReportsContextProps = {
    query: {
        startDate?: Date,
        endDate?: Date
    },
    data: {
        isFetching: boolean,
        data: RequestedStockItemWithExtrasAndRequestExtras[],
        visibleData: RequestedStockItemWithExtrasAndRequestExtras[]
    },
    table: {
        sortDescriptor?: SortDescriptor
    }
    filters: {
        status?: (StockRequestStatus | 'EXTRA_DELIVERED')[],
        requestedBy?: string[],
        assignedTo?: string[],
        reviewedBy?: string[],
        items?: string[],
        locations?: string[]
    }
}

export type RequestedStockItemWithExtrasAndRequestExtras = RequestedStockItemWithOptionalExtras & {
    assignedLocation: StockRequestWithOptionalExtras["assignedLocation"],
    requestedBy: StockRequestWithOptionalExtras["requestedByUser"],
    assignedTo: StockRequestWithOptionalExtras["assignedToUsers"],
    reviewedBy: StockRequestWithOptionalExtras["reviewedByUser"],
    deliveredAt: StockRequestWithOptionalExtras["deliveredAt"]
}

export enum InventoryRequestsReportActions {
    UPDATE_QUERY,
    UPDATE_DATA,
    UPDATE_FILTERS,
    UPDATE_TABLE,
}

type InventoryRequestsReportAction = {
    type: InventoryRequestsReportActions.UPDATE_FILTERS,
    payload: Partial<InventoryRequestsReportsContextProps["filters"]>
} | {
    type: InventoryRequestsReportActions.UPDATE_DATA,
    payload: Partial<InventoryRequestsReportsContextProps["data"]>
} | {
    type: InventoryRequestsReportActions.UPDATE_QUERY,
    payload: Partial<InventoryRequestsReportsContextProps["query"]>
} | {
    type: InventoryRequestsReportActions.UPDATE_TABLE,
    payload: Partial<InventoryRequestsReportsContextProps["table"]>
}

const [InventoryRequestsReportContext, useHook] =
    createGenericContext<UseReducerArray<InventoryRequestsReportsContextProps, InventoryRequestsReportAction>>("useInventoryRequestsReport must be used within an InventoryRequestsReportProvider");


const inventoryRequestsReportReducer = (state: InventoryRequestsReportsContextProps, action: InventoryRequestsReportAction): InventoryRequestsReportsContextProps => {
    switch (action.type) {
        case InventoryRequestsReportActions.UPDATE_QUERY:
            return {
                ...state,
                query: { ...state.query, ...action.payload }
            };
        case InventoryRequestsReportActions.UPDATE_DATA:
            return {
                ...state,
                data: { ...state.data, ...action.payload }
            };
        case InventoryRequestsReportActions.UPDATE_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, ...action.payload }
            };
        case InventoryRequestsReportActions.UPDATE_TABLE:
            return {
                ...state,
                table: { ...state.table, ...action.payload }
            };
        default:
            return state;
    }
};

const InventoryRequestsReportProvider: FC<PropsWithChildren> = ({ children }) => {
    const reducer = useReducer(inventoryRequestsReportReducer, {
        query: {
            startDate: undefined,
            endDate: undefined
        },
        table: {
            sortDescriptor: undefined,
        },
        data: {
            isFetching: false,
            data: [],
            visibleData: []
        },
        filters: {
            status: undefined,
            requestedBy: undefined,
            assignedTo: undefined,
            reviewedBy: undefined,
            items: undefined,
            locations: undefined
        }
    });

    return (
        <InventoryRequestsReportContext.Provider value={reducer}>
            {children}
        </InventoryRequestsReportContext.Provider>
    );
};

export default InventoryRequestsReportProvider;

export const useInventoryRequestsReport = () => useHook();
