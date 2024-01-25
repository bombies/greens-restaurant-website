"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUserData } from "../../../../../../utils/Hooks";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";

type SelectedRequestsTabKey = "my_requests" | "all_requests";
const URL_QUERY_KEY = "requests_tab";

const useSelectedRequestsTab = () => {
    const { data: userData, isLoading: userDataLoading } = useUserData();
    const [selectedTabKey, setSelectedTabKey] = useState<SelectedRequestsTabKey>("my_requests");
    const searchParams = useSearchParams();

    const updateTabKey = useCallback((key: SelectedRequestsTabKey | null) => {
        const params = new URLSearchParams(searchParams.toString());
        setSelectedTabKey(() => {
            params.set(URL_QUERY_KEY, !key ? "my_requests" : (key.toLowerCase() !== "my_requests" && key.toLowerCase() !== "all_requests" ? "my_requests" : key.toLowerCase()));
            window.history.pushState(null, "", `?${params.toString()}`);
            return !key ? "my_requests" : key.toLowerCase() as SelectedRequestsTabKey;
        });
    }, [searchParams]);

    useEffect(() => {
        if (!userDataLoading && userData && hasAnyPermission(userData.permissions, [
            Permission.VIEW_STOCK_REQUESTS,
            Permission.MANAGE_STOCK_REQUESTS,
            Permission.CREATE_STOCK_REQUEST
        ])) {
            const tab = searchParams.get(URL_QUERY_KEY) as SelectedRequestsTabKey | null;
            updateTabKey(tab);
        }
    }, [searchParams, updateTabKey, userData, userDataLoading]);

    return { selectedTabKey, updateTabKey };
};

export default useSelectedRequestsTab;