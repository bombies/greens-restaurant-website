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

const useMostRecentSnapshot = (barName: string) => {
    const mutator = (url: string) => axios.get(url);
    return useSWRMutation(`/api/inventory/bar/${barName}/snapshots/mostrecent`, mutator);
};

const useCurrentSectionSnapshots = (barName: string) => {
    return useSWR(`/api/inventory/bar/${barName}/snapshots/current`, fetcher<InventorySectionSnapshotWithOptionalExtras[]>);
};

const ChecksAndBalancesButton: FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const { trigger: fetchMostRecentSnapshot, isMutating: isFetching, data: response } = useMostRecentSnapshot("bar");
    const { data: currentSectionSnapshots, isLoading: currentSnapshotsLoading } = useCurrentSectionSnapshots("bar");
    const sectionTables = useMemo(() => (
        (response?.data as InventorySectionSnapshotWithOptionalExtras[] | undefined)?.map(section => (
            <ChecksAndBalancesTable
                key={section.id}
                previousSnapshot={section}
                currentSnapshot={currentSectionSnapshots?.find(currentSection => currentSection.uid === section.uid)}
            />
        )) ?? []
    ), [currentSectionSnapshots, response?.data]);

    return (
        <Fragment>
            <GenericModal
                title="Checks & Balances"
                isOpen={modalOpen}
                size="5xl"
                scrollBehavior="outside"
                onClose={() => setModalOpen(false)}
            >
                {
                    isFetching || currentSnapshotsLoading ?
                        <div className="flex justify-center">
                            <Spinner
                                label="Loading data..."
                                labelColor="primary"
                                size="lg"
                            />
                        </div>
                        :
                        sectionTables
                }
            </GenericModal>
            <GenericButton
                variant="flat"
                startContent={<DollarIcon />}
                onPress={() => {
                    setModalOpen(true);
                    fetchMostRecentSnapshot()
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