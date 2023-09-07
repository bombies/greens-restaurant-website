"use client";

import { Dispatch, FC, SetStateAction, useState } from "react";
import { SelectItem } from "@nextui-org/react";
import GenericSelectMenu from "../../../../../../../_components/GenericSelectMenu";
import { Chip } from "@nextui-org/chip";
import InventoryRequestedItemsContainer from "./InventoryRequestedItemsContainer";
import { Avatar } from "@nextui-org/avatar";
import { useS3AvatarUrls } from "../../../../../../../_components/hooks/useS3Base64String";
import useSWR, { KeyedMutator } from "swr";
import { StockRequestWithOptionalCreatorAndAssignees } from "../../inventory-requests-utils";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { User } from "@prisma/client";
import { FetchAllInventories } from "../../../InventoryGrid";

type Props = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    mutator: KeyedMutator<StockRequestWithOptionalCreatorAndAssignees[] | undefined>
    visibleData?: StockRequestWithOptionalCreatorAndAssignees[],
}

const FetchValidAssignees = () => {
    return useSWR("/api/inventory/requests/assignees", fetcher<Pick<User, "id" | "username" | "permissions" | "firstName" | "lastName" | "image" | "avatar">[]>);
};

const NewInventoryRequestForm: FC<Props> = ({ setModalOpen, mutator, visibleData }) => {
    const { data, isLoading } = FetchAllInventories();
    const [snapshotsLoading, setSnapshotsLoading] = useState(false);
    const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
    const {
        data: availableAssignees,
        isLoading: isLoadingAvailableAssignees
    } = FetchValidAssignees();
    const { avatars, isLoading: avatarsLoading } = useS3AvatarUrls(availableAssignees ?? []);

    return (
        <div className="space-y-6">
            <div className="flex gap-4 phone:flex-col">
                <GenericSelectMenu
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
                {
                    (avatarsLoading || isLoadingAvailableAssignees) ||
                    <GenericSelectMenu
                        selectionMode="multiple"
                        id="selected_assignees"
                        placeholder="Select assignees..."
                        variant="flat"
                        disabled={snapshotsLoading || isLoadingAvailableAssignees || avatarsLoading}
                        items={availableAssignees ?? []}
                        selectedKeys={selectedAssigneeIds}
                        onSelectionChange={selection => setSelectedAssigneeIds(Array.from(selection) as string[])}
                    >
                        {assignee => {
                            const avatarSrc = avatars?.find(userAvatar =>
                                    userAvatar.userId === assignee.id)?.avatar
                                || (assignee.image || undefined);

                            return (
                                <SelectItem
                                    key={assignee.id}
                                    className="capitalize"
                                    startContent={<Avatar
                                        src={avatarSrc}
                                    />}
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
                mutator={mutator}
                visibleData={visibleData}
                setSnapshotsLoading={setSnapshotsLoading}
                selectedIds={selectedInventoryIds}
                selectedAssigneeIds={selectedAssigneeIds}
                setModalOpen={setModalOpen}
            />
        </div>
    );
};

export default NewInventoryRequestForm;