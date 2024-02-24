"use client";

import { Dispatch, FC, SetStateAction, useState } from "react";
import { SelectItem } from "@nextui-org/react";
import GenericSelectMenu from "../../../../../../../_components/inputs/GenericSelectMenu";
import { Chip } from "@nextui-org/chip";
import InventoryRequestedItemsContainer from "./InventoryRequestedItemsContainer";
import { Avatar } from "@nextui-org/avatar";
import useSWR from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { User } from "@prisma/client";
import { FetchAllInventories } from "../../../InventoryGrid";
import useLocations from "../../../../../locations/components/hooks/useLocations";
import { getUserAvatarStringHeadless } from "app/(site)/(accessible-site)/employees/employee-utils";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";

type Props = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    onRequestCreate: (request: StockRequestWithOptionalExtras) => void
}

const FetchValidAssignees = () => {
    return useSWR("/api/inventory/requests/assignees", fetcher<Pick<User, "id" | "username" | "permissions" | "firstName" | "lastName" | "image" | "avatar">[]>);
};

const NewInventoryRequestForm: FC<Props> = ({ setModalOpen, onRequestCreate }) => {
    const { data, isLoading } = FetchAllInventories();
    const { data: locations, isLoading: locationsLoading } = useLocations();
    const [snapshotsLoading, setSnapshotsLoading] = useState(false);
    const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string>();
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
    const {
        data: availableAssignees,
        isLoading: isLoadingAvailableAssignees
    } = FetchValidAssignees();

    return (
        <div className="space-y-6">
            <div className="flex gap-4 phone:flex-col">
                <GenericSelectMenu
                    label="From"
                    isRequired
                    selectionMode="multiple"
                    id="selected_inventories"
                    placeholder="Select inventories..."
                    items={data ?? []}
                    isDisabled={isLoading || snapshotsLoading}
                    selectedKeys={selectedInventoryIds}
                    onSelectionChange={selection => setSelectedInventoryIds(Array.from(selection) as string[])}
                    variant="flat"
                    renderValue={(items) => {
                        return (
                            <div className="flex flex-wrap gap-2">
                                {items.map((item) => (
                                    <Chip
                                        color="primary"
                                        variant="flat"
                                        className="capitalize"
                                        key={item.key}
                                    >
                                        {item.data?.name.replaceAll("-", " ")}
                                    </Chip>
                                ))}
                            </div>
                        );
                    }}
                >
                    {(inventory) => (
                        <SelectItem key={inventory.id} className="capitalize">
                            {inventory.name.replaceAll("-", " ")}
                        </SelectItem>
                    )}
                </GenericSelectMenu>
                <GenericSelectMenu
                    isRequired
                    label="To"
                    selectionMode="single"
                    disallowEmptySelection
                    id="selected_location"
                    placeholder="Select location..."
                    items={locations ?? []}
                    isDisabled={locationsLoading || snapshotsLoading}
                    selectedKeys={selectedLocationId ? [selectedLocationId] : []}
                    onSelectionChange={selection => setSelectedLocationId((Array.from(selection) as string[])[0])}
                    variant="flat"
                    renderValue={(items) => {
                        return (
                            <div className="flex flex-wrap gap-2">
                                {items.map((item) => (
                                    <Chip
                                        color="primary"
                                        variant="flat"
                                        className="capitalize"
                                        key={item.key}
                                    >
                                        {item.data?.name.replaceAll("-", " ")}
                                    </Chip>
                                ))}
                            </div>
                        );
                    }}
                >
                    {(inventory) => (
                        <SelectItem key={inventory.id} className="capitalize">
                            {inventory.name.replaceAll("-", " ")}
                        </SelectItem>
                    )}
                </GenericSelectMenu>
                {
                    (isLoadingAvailableAssignees) ||
                    <GenericSelectMenu
                        label="Assigned To"
                        selectionMode="multiple"
                        id="selected_assignees"
                        placeholder="Select assignees..."
                        variant="flat"
                        disabled={snapshotsLoading || isLoadingAvailableAssignees}
                        items={availableAssignees ?? []}
                        selectedKeys={selectedAssigneeIds}
                        onSelectionChange={selection => setSelectedAssigneeIds(Array.from(selection) as string[])}
                    >
                        {assignee => {
                            const avatarSrc = getUserAvatarStringHeadless(assignee.avatar ?? undefined, assignee.id, assignee.image ?? undefined);

                            return (
                                <SelectItem
                                    key={assignee.id}
                                    className="capitalize"
                                    startContent={<Avatar src={avatarSrc} />}
                                >
                                    {`${assignee.firstName} ${assignee.lastName}`}
                                </SelectItem>
                            );
                        }
                        }
                    </GenericSelectMenu>
                }
            </div>
            <InventoryRequestedItemsContainer
                onRequestCreate={onRequestCreate}
                setSnapshotsLoading={setSnapshotsLoading}
                selectedIds={selectedInventoryIds}
                selectedLocationId={selectedLocationId}
                selectedAssigneeIds={selectedAssigneeIds}
                setModalOpen={setModalOpen}
            />
        </div>
    );
};

export default NewInventoryRequestForm;