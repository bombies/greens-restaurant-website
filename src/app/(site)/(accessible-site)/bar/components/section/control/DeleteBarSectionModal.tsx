"use client";

import { Dispatch, FC, SetStateAction } from "react";
import { InventorySection } from "@prisma/client";
import ConfirmationModal from "../../../../../../_components/ConfirmationModal";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../utils/Hooks";

type Props = {
    barName: string,
    section: InventorySection,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    deleteSection: () => Promise<void>
}

const DeleteBarSection = (barName: string, sectionId: string) => {
    const mutator = (url: string) => axios.delete(url);
    return useSWRMutation(`/api/inventory/bar/${barName}/${sectionId}`, mutator);
};

const DeleteBarSectionModal: FC<Props> = ({ barName, section, isOpen, setOpen, deleteSection }) => {
    const { trigger: deleteBarSection, isMutating: isDeleting } = DeleteBarSection(barName, section.id);

    return (
        <ConfirmationModal
            isOpen={isOpen}
            setOpen={setOpen}
            title={`Delete ${section.name}?`}
            message={`Are you sure you want to delete ${section.name}?`}
            accepting={isDeleting}
            onAccept={() => {
                deleteBarSection()
                    .then(async (res) => {
                        const deletedSection: InventorySection = res.data;
                        await deleteSection();
                        toast.success(`You have successfully deleted ${deletedSection.name}!`);
                    })
                    .catch(e => {
                        console.error(e);
                        errorToast(e, "There was an error when attempting to delete this section!");
                    });
            }}
        />
    );
};

export default DeleteBarSectionModal;