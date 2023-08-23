"use client";

import { FC } from "react";
import GenericTabs from "../../../../../_components/GenericTabs";
import { Tab } from "@nextui-org/react";
import UserInventoryRequestsTab from "./user/UserInventoryRequestsTab";

const InventoryRequestsContainer: FC = () => {
    return (
        <div className="default-container p-12 phone:px-4 w-5/6 tablet:w-full">
            <GenericTabs>
                <Tab key="my_requests" title="My Requests">
                    <UserInventoryRequestsTab />
                </Tab>
                <Tab key="all_requests" title="All Requests">

                </Tab>
            </GenericTabs>
        </div>
    );
};

export default InventoryRequestsContainer;