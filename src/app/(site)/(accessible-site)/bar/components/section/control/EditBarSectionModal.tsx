"use client";

import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import GenericModal from "../../../../../../_components/GenericModal";
import { InventorySection } from "@prisma/client";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../_components/inputs/GenericInput";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import EditIcon from "../../../../../../_components/icons/EditIcon";
import {
    InventorySectionSnapshotWithOptionalExtras,
    UpdateInventorySectionDto
} from "../../../../../../api/inventory/bar/[name]/types";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { errorToast } from "../../../../../../../utils/Hooks";
import { toast } from "react-hot-toast";
import { PartialInventorySection } from "../BarSection";

type Props = {
    barName: string,
    section: InventorySection,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    mutateSection: (newInfo: PartialInventorySection) => Promise<void>
}

type EditBarSectionArgs = {
    arg: {
        dto: UpdateInventorySectionDto
    }
}

const EditBarSection = (barName: string, sectionId: string) => {
    const mutator = (url: string, { arg }: EditBarSectionArgs) => axios.patch(url, arg.dto);
    return useSWRMutation(`/api/inventory/bar/${barName}/${sectionId}`, mutator);
};

const EditBarSectionModal: FC<Props> = ({ barName, section, mutateSection, isOpen, setOpen }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [newName, setNewName] = useState(section.name);
    const { trigger: editBarSection, isMutating: isEditing } = EditBarSection(barName, section.id);

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        const name = data.newName;
        editBarSection({
            dto: { name }
        }).then(async (res) => {
            const updatedItem: InventorySectionSnapshotWithOptionalExtras = res.data;
            await mutateSection(updatedItem);
            toast.success("Successfully updated this section!");
            setOpen(false);
        })
            .catch(e => {
                console.error(e);
                errorToast(e, `Could not update ${section.name.replaceAll("-", " ")}!`);
            });
    }, [editBarSection, mutateSection, section.name, setOpen]);

    return (
        <GenericModal
            title={`Edit ${section.name.replace("-", " ")}`}
            isOpen={isOpen}
            onClose={() => setOpen(false)}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <GenericInput
                        register={register}
                        errors={errors}
                        isDisabled={isEditing}
                        id="newName"
                        label="Edit Name"
                        placeholder="Enter a new name..."
                        value={newName}
                        onValueChange={setNewName}
                    />
                    <GenericButton
                        type="submit"
                        variant="flat"
                        isDisabled={isEditing}
                        isLoading={isEditing}
                        startContent={<EditIcon />}
                    >
                        Edit
                    </GenericButton>
                </div>
            </form>
        </GenericModal>
    );
};

export default EditBarSectionModal;