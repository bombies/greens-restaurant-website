"use client";

import { FC, Fragment, useMemo, useState } from "react";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import DollarIcon from "../../../../../_components/icons/DollarIcon";
import GenericModal from "../../../../../_components/GenericModal";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { errorToast } from "../../../../../../utils/Hooks";
import { Spinner } from "@nextui-org/spinner";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../api/inventory/bar/[name]/types";
import ChecksAndBalancesTable from "./table/ChecksAndBalancesTable";
import useSWR from "swr";
import { fetcher } from "../../../employees/_components/EmployeeGrid";
import SubTitle from "../../../../../_components/text/SubTitle";
import { RequestedStockItem } from "@prisma/client";
import { InventoryWithOptionalExtras } from "../../../../../api/inventory/[name]/types";

const useMostRecentSnapshot = (barName: string) => {
    const mutator = (url: string) => axios.get(url);
    return useSWRMutation(`/api/inventory/bar/${barName}/snapshots/mostrecent`, mutator);
};


const useCurrentSectionSnapshots = (barName: string) => {
    const mutator = (url: string) => fetcher<InventorySectionSnapshotWithOptionalExtras[]>(url);
    return useSWRMutation(`/api/inventory/bar/${barName}/snapshots/current`, mutator);
};

const usePreviousWeekInventoryRequestInfo = (stockIds?: (string | undefined)[]) => {
    const previousSunday = new Date();
    previousSunday.setHours(0, 0, 0, 0);
    previousSunday.setDate(previousSunday.getDate() - (previousSunday.getDay() || 7));

    const latestDate = new Date();
    latestDate.setHours(11, 59, 59, 999);
    if (latestDate.getDay() === 0)
        latestDate.setDate(latestDate.getDate() - 1);
    return useSWR(stockIds ? `/api/inventory/requests/items?ids=${stockIds?.filter(id => id).toString()}&from=${previousSunday.getTime()}$to=${latestDate.getTime()}` : [], fetcher<RequestedStockItem[]>);
};

type Props = {
    barInfo?: InventoryWithOptionalExtras
}

const ChecksAndBalancesButton: FC<Props> = ({ barInfo }) => {
    const {
        data: previousWeekRequestedItems,
        isLoading: loadingPreviousWeekRequestedItems
    } = usePreviousWeekInventoryRequestInfo(barInfo?.inventorySections?.map(section => section.assignedStock?.map(stock => stock.id)).flat());
    const [modalOpen, setModalOpen] = useState(false);
    const { trigger: fetchMostRecentSnapshot, isMutating: isFetching, data: response } = useMostRecentSnapshot("bar");
    const {
        trigger: fetchCurrentSectionSnapshots,
        data: currentSectionSnapshots,
        isMutating: currentSnapshotsLoading
    } = useCurrentSectionSnapshots("bar");
    const sectionTables = useMemo(() => (
        (response?.data as InventorySectionSnapshotWithOptionalExtras[] | undefined)?.map(section => (
            <ChecksAndBalancesTable
                key={section.id}
                previousSnapshot={section}
                currentSnapshot={currentSectionSnapshots?.find(currentSection => currentSection.uid === section.uid)}
                requestedStockItems={previousWeekRequestedItems ?? []}
            />
        )) ?? []
    ), [currentSectionSnapshots, previousWeekRequestedItems, response?.data]);

    return (
        <Fragment>
            <GenericModal
                title="Checks & Balances"
                isOpen={modalOpen}
                size="5xl"
                scrollBehavior={sectionTables.length ? "outside" : "inside"}
                onClose={() => setModalOpen(false)}
            >
                {
                    isFetching || currentSnapshotsLoading || loadingPreviousWeekRequestedItems ?
                        <div className="flex justify-center">
                            <Spinner
                                label="Loading data..."
                                labelColor="primary"
                                size="lg"
                            />
                        </div>
                        :
                        sectionTables.length ?
                            sectionTables
                            :
                            <SubTitle className="text-neutral-600">There is no previous data to work with...</SubTitle>
                }
            </GenericModal>
            <GenericButton
                variant="flat"
                startContent={<DollarIcon />}
                onPress={() => {
                    setModalOpen(true);
                    fetchCurrentSectionSnapshots()
                        .then(() => fetchMostRecentSnapshot())
                        .catch((e) => {
                            console.error(e);
                            errorToast(e, "There was an error generating checks & balances.");
                        });
                }}
            >
                Checks & Balances
            </GenericButton>
        </Fragment>
    );
};

export default ChecksAndBalancesButton;