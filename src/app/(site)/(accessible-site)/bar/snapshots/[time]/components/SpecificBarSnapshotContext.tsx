"use client";

import { FC, Fragment, useEffect, useMemo } from "react";
import useBarSnapshot from "./hooks/useBarSnapshot";
import { useUserData } from "../../../../../../../utils/Hooks";
import Permission from "../../../../../../../libs/types/permission";
import { useRouter } from "next/navigation";
import useBarInfo from "../../../components/hooks/useBarInfo";
import { Skeleton, Spacer } from "@nextui-org/react";
import TableSkeleton from "../../../../../../_components/skeletons/TableSkeleton";
import { Divider } from "@nextui-org/divider";
import BarStockTable from "../../../components/section/table/BarStockTable";
import { InventorySectionSnapshotWithExtras } from "../../../../../../api/inventory/[name]/types";
import SubTitle from "../../../../../../_components/text/SubTitle";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { RequestedStockItem } from "@prisma/client";

type Props = {
    time: string
}

const useCurrentWeekInventoryRequestInfo = (stockIds?: (string | undefined)[], from?: number) => {
    const previousSunday = new Date(from ?? 0);
    previousSunday.setHours(0, 0, 0, 0);
    if (previousSunday.getDate() !== 0)
        previousSunday.setDate(previousSunday.getDate() - (previousSunday.getDay() || 7));

    const nextSaturday = new Date(from ?? 0);
    nextSaturday.setHours(11, 59, 59, 999);
    nextSaturday.setDate(nextSaturday.getDate() + (7 + 6 - nextSaturday.getDay()) % 7);
    return useSWR(from && stockIds ? `/api/inventory/requests/items?ids=${stockIds?.filter(id => id).toString()}&from=${previousSunday.getTime()}&to${nextSaturday.getTime()}` : [], fetcher<RequestedStockItem[]>);
};


const SpecificBarSnapshotContext: FC<Props> = ({ time }) => {
    useUserData([
        Permission.MUTATE_BAR_INVENTORY,
        Permission.MUTATE_STOCK,
        Permission.CREATE_INVENTORY
    ]);
    const { data: snapshot, isLoading } = useBarSnapshot(Number(time));
    const router = useRouter();
    const { data: barInfo, isLoading: barInfoLoading } = useBarInfo();
    const {
        data: requestedItems,
        isLoading: requestedItemsLoading
    } = useCurrentWeekInventoryRequestInfo(barInfo?.inventorySections?.map(section => section.assignedStock?.map(stock => stock.id)).flat(), Number(time));

    useEffect(() => {
        if (!isLoading && !snapshot)
            router.push("/bar");
    }, [isLoading, router, snapshot]);

    const sections = useMemo(() => snapshot?.data.map(sectionSnapshot => (
        <Fragment key={sectionSnapshot.id}>
            <div className="default-container p-6">
                <BarStockTable
                    barName={barInfo?.name}
                    section={sectionSnapshot.inventorySection}
                    currentSnapshot={sectionSnapshot as InventorySectionSnapshotWithExtras}
                    stockIsLoading={isLoading || requestedItemsLoading}
                    mutationAllowed={false}
                    requestedItems={requestedItems ?? []}
                />
            </div>
            <Divider className="my-6" />
        </Fragment>
    )), [barInfo?.name, isLoading, requestedItems, requestedItemsLoading, snapshot?.data]);

    return (
        <div className="default-container p-12 phone:px-4">
            {
                (!isLoading && snapshot) && (
                    <>
                        <div className="default-container p-12">
                            <SubTitle>You are currently viewing the inventory snapshot
                                for {new Date(snapshot.createdAt).toLocaleDateString("en-JM")}</SubTitle>
                        </div>
                        <Spacer y={6} />
                    </>
                )
            }
            {
                barInfoLoading ?
                    <div className="default-container p-6">
                        <Skeleton className="rounded-2xl w-1/4 h-6" />
                        <Spacer y={6} />
                        <Skeleton className="rounded-2xl w-1/4 h-12" />
                        <Spacer y={6} />
                        <TableSkeleton columns={[
                            {
                                key: "stock_name",
                                value: "Name"
                            },
                            {
                                key: "stock_quantity",
                                value: "Quantity"
                            }
                        ]} contentRepeat={10} />
                    </div>
                    :
                    (sections?.length === 0 ?
                            <SubTitle>{`There are no sections.`}</SubTitle>
                            :
                            sections
                    )
            }
        </div>
    );
};

export default SpecificBarSnapshotContext;