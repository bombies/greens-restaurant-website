"use client";

import useSWR from "swr";
import { fetcher } from "../../employees/_components/EmployeeGrid";
import { Inventory } from ".prisma/client";
import SubTitle from "../../../../_components/text/SubTitle";
import { useEffect, useState } from "react";
import InventoryCard from "./InventoryCard";
import { Spacer } from "@nextui-org/react";
import ContainerSkeleton from "../../../../_components/skeletons/ContainerSkeleton";
import CardSkeleton from "../../../../_components/skeletons/CardSkeleton";

const useInventoryData = () => {
    return useSWR("/api/inventory", fetcher<Inventory[]>);
};

export default function InventoryGrid() {
    const { data, isLoading } = useInventoryData();
    const [visibleInventories, setVisibleInventories] = useState<Inventory[]>([]);

    useEffect(() => {
        if (!isLoading && data)
            setVisibleInventories(data);
    }, [data, isLoading, setVisibleInventories]);

    const inventoryCards = visibleInventories.map(inventory => (
        <InventoryCard key={inventory.id} name={inventory.name} />
    ));

    return (
        <div className="default-container p-12 phone:px-4 w-5/6 tablet:w-full">
            <SubTitle>Inventories</SubTitle>
            <Spacer y={6} />
            <div className="grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-6">
                {
                    isLoading ?
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                        :
                        <>
                            {inventoryCards}
                        </>
                }
            </div>
        </div>
    );
}