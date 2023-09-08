"use client";

import { useEffect, useState } from "react";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import { User } from "@prisma/client";

const useSelectedInventoryTab = (userDataIsLoading: boolean, userData?: User) => {
    const [selectedTabKey, setSelectedTabKey] = useState("inventory");

    useEffect(() => {
        if (!userDataIsLoading && userData)
            setSelectedTabKey(hasAnyPermission(userData.permissions, [
                Permission.VIEW_INVENTORY,
                Permission.CREATE_INVENTORY,
                Permission.MUTATE_STOCK
            ]) ? "inventory" : "requests");
    }, [userData, userDataIsLoading]);

    return { selectedTabKey, setSelectedTabKey };
};

export default useSelectedInventoryTab;