"use client";

import { FC, Fragment, useCallback, useState } from "react";
import GenericModal from "../../../../../_components/GenericModal";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import {
    CreateInventorySectionDto,
    InventorySectionWithOptionalExtras
} from "../../../../../api/inventory/location/[name]/types";
import { errorToast } from "../../../../../../utils/Hooks";
import { toast } from "react-hot-toast";
import PlusIcon from "../../../../../_components/icons/PlusIcon";

type CreateSectionArgs = {
    arg: {
        dto: CreateInventorySectionDto
    }
}

const CreateSection = (locationName: string) => {
    const mutator = (url: string, { arg }: CreateSectionArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/inventory/location/${locationName}`, mutator);
};

type Props = {
    locationName: string
    disabled?: boolean,
    addSection: (newSection: InventorySectionWithOptionalExtras) => Promise<void>
}

const AddSectionButton: FC<Props> = ({ locationName, disabled, addSection }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { trigger: createSection, isMutating: isCreating } = CreateSection(locationName);
    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        const name: string = data.sectionName;
        createSection({
            dto: { name }
        })
            .then(async (res) => {
                const createdSection: InventorySectionWithOptionalExtras = res.data;
                await addSection(createdSection);
                toast.success("Successfully created a new section!");
                setModalOpen(false);
            })
            .catch(e => {
                console.error(e);
                errorToast(e, "There was an error creating this section!");
            });
    }, [addSection, createSection]);

    return (
        <Fragment>
            <GenericModal
                title="Add A Section"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        <GenericInput
                            label="Section Name"
                            placeholder="Enter a name..."
                            disabled={isCreating}
                            register={register}
                            id="sectionName"
                            maxLength={50}
                            isRequired
                            errors={errors}
                        />
                        <GenericButton
                            variant="flat"
                            type="submit"
                            startContent={<PlusIcon />}
                            disabled={isCreating}
                            isLoading={isCreating}
                        >
                            Create
                        </GenericButton>
                    </div>
                </form>
            </GenericModal>
            <GenericButton
                onPress={() => setModalOpen(true)}
                disabled={disabled}
                startContent={<PlusIcon />}
            >
                Add Section
            </GenericButton>
        </Fragment>
    );
};

export default AddSectionButton;