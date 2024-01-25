"use client";

import { useCallback, useEffect, useState } from "react";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import { User } from "@prisma/client";
import { useSearchParams } from "next/navigation";

const useSelectedInventoryTab = (userDataIsLoading: boolean, userData?: User) => {
    const [selectedTabKey, setSelectedTabKey] = useState<"inventory" | "requests">("inventory");
    const searchParams = useSearchParams();

    const updateTabKey = useCallback((key: "inventory" | "requests") => {
        const params = new URLSearchParams();
        setSelectedTabKey(() => {
            params.set("inventory_tab", key);
            if (key === "requests")
                params.set("requests_tab", "my_requests")
            window.history.pushState(null, "", `?${params.toString()}`);
            return key;
        });
    }, []);

    useEffect(() => {
        if (!userDataIsLoading && userData && hasAnyPermission(userData.permissions, [
            Permission.VIEW_INVENTORY,
            Permission.CREATE_INVENTORY,
            Permission.MUTATE_STOCK,
            Permission.VIEW_STOCK_REQUESTS,
            Permission.MANAGE_STOCK_REQUESTS,
            Permission.CREATE_STOCK_REQUEST
        ])) {
            if (searchParams.has("inventory_tab")) {
                const tab = searchParams.get("inventory_tab");
                if (tab === "requests" && hasAnyPermission(userData.permissions, [
                    Permission.VIEW_STOCK_REQUESTS,
                    Permission.MANAGE_STOCK_REQUESTS,
                    Permission.CREATE_STOCK_REQUEST
                ])) {
                    updateTabKey("requests");
                } else if (hasAnyPermission(userData.permissions, [
                    Permission.VIEW_INVENTORY,
                    Permission.CREATE_INVENTORY,
                    Permission.MUTATE_STOCK
                ])) {
                    updateTabKey("inventory");
                }
            } else {
                updateTabKey(hasAnyPermission(userData.permissions, [
                    Permission.VIEW_INVENTORY,
                    Permission.CREATE_INVENTORY,
                    Permission.MUTATE_STOCK
                ]) ? "inventory" : "requests");
            }
        }
    }, [searchParams, updateTabKey, userData, userDataIsLoading]);

    return { selectedTabKey, updateTabKey };
};

export default useSelectedInventoryTab;