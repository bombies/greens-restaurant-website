"use client";

import { FC, Fragment, Key, useCallback, useState } from "react";
import PlusIcon from "../../../../../../_components/icons/PlusIcon";
import { Button, DropdownItem, DropdownSection } from "@nextui-org/react";
import GenericDropdown from "../../../../../../_components/GenericDropdown";
import EditIcon from "../../../../../../_components/icons/EditIcon";
import TrashIcon from "../../../../../../_components/icons/TrashIcon";
import EditBarSectionModal from "./EditBarSectionModal";
import { InventorySection } from "@prisma/client";
import { PartialInventorySection } from "../BarSection";
import DeleteBarSectionModal from "./DeleteBarSectionModal";
import VerticalDotsIcon from "../../../../../../_components/icons/VerticalDotsIcon";

type Props = {
    barName: string,
    section: InventorySection,
    mutateSection: (newInfo: PartialInventorySection) => Promise<void>,
    deleteSection: () => Promise<void>,
}

const BarSectionControl: FC<Props> = ({ barName, section, mutateSection, deleteSection }) => {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleAction = useCallback((action: Key) => {
        switch (action) {
            case "edit": {
                setEditModalOpen(true);
                break;
            }
            case "delete": {
                setDeleteModalOpen(true);
                break;
            }
        }
    }, []);

    return (
        <Fragment>
            <EditBarSectionModal
                barName={barName}
                section={section}
                mutateSection={mutateSection}
                isOpen={editModalOpen}
                setOpen={setEditModalOpen}
            />
            <DeleteBarSectionModal
                barName={barName}
                section={section}
                isOpen={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                deleteSection={deleteSection}
            />
            <GenericDropdown
                placement="bottom-end"
                trigger={
                    <Button
                        size="sm"
                        isIconOnly
                        color="default"
                        variant="flat"
                    >
                        <VerticalDotsIcon width={18} />
                    </Button>
                }
                onAction={handleAction}
            >
                <DropdownSection showDivider>
                    <DropdownItem
                        key="edit"
                        color="warning"
                        startContent={<EditIcon width={16} />}
                    >
                        Edit Section
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection
                    title="DANGER ZONE"
                >
                    <DropdownItem
                        key="delete"
                        color="danger"
                        variant="flat"
                        startContent={<TrashIcon width={16} />}
                    >
                        Delete Section
                    </DropdownItem>
                </DropdownSection>
            </GenericDropdown>
        </Fragment>
    );
};

export default BarSectionControl;