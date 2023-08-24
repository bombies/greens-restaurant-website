"use client";

import { Dispatch, FC, SetStateAction, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { FetchAllInventories } from "../../../InventoryGrid";
import { SelectItem } from "@nextui-org/react";
import GenericSelectMenu from "../../../../../../../_components/GenericSelectMenu";
import { Chip } from "@nextui-org/chip";
import InventoryRequestedItemsContainer from "./InventoryRequestedItemsContainer";
import { Avatar } from "@nextui-org/avatar";
import { FetchUsersWithPermissions } from "../../../../../../../../utils/client-utils";
import Permission from "../../../../../../../../libs/types/permission";
import { useS3AvatarUrls, useS3Base64AvatarStrings } from "../../../../../../../_components/hooks/useS3Base64String";

type Props = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
}

const NewInventoryRequestForm: FC<Props> = ({ setModalOpen }) => {
    const { data, isLoading } = FetchAllInventories();
    const [snapshotsLoading, setSnapshotsLoading] = useState(false);
    const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
    const {
        data: availableAssignees,
        isLoading: isLoadingAvailableAssignees
    } = FetchUsersWithPermissions([Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY]);
    const { avatars, isLoading: avatarsLoading } = useS3AvatarUrls(availableAssignees ?? []);

    return (
        <div className="space-y-6">
            <div className="flex gap-4 phone:flex-col">
                <GenericSelectMenu
                    selectionMode="multiple"
                    id="selected_inventories"
                    placeholder="Select inventories..."
                    items={data ?? []}
                    disabled={isLoading || snapshotsLoading}
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
                        id="selected_assignees"
                        placeholder="Select assignees..."
                        variant="flat"
                        disabled={snapshotsLoading || isLoadingAvailableAssignees || avatarsLoading}
                        items={availableAssignees ?? []}
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
                setSnapshotsLoading={setSnapshotsLoading}
                selectedIds={selectedInventoryIds}
                setModalOpen={setModalOpen}
            />
        </div>
    );
};

export default NewInventoryRequestForm;