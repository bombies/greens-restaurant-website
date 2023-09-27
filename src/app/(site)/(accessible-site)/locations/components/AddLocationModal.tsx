"use client";

import { Dispatch, FC, SetStateAction, useCallback } from "react";
import GenericModal from "../../../../_components/GenericModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../_components/inputs/GenericInput";
import GenericButton from "../../../../_components/inputs/GenericButton";
import PlusCircledIcon from "../../../../_components/icons/PlusCircledIcon";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { CreateLocationDto } from "../../../../api/inventory/location/types";
import { Inventory } from "@prisma/client";
import { toast } from "react-hot-toast";
import "../../../../../utils/GeneralUtils";
import { errorToast } from "../../../../../utils/Hooks";

type Props = {
    modalOpen: boolean,
    setModalOpen: Dispatch<SetStateAction<boolean>>,
    addOptimisticLocation: (location: Inventory) => Promise<void>
}

type AddLocationArgs = {
    arg: {
        dto: CreateLocationDto
    }
}

const AddLocation = () => {
    const mutator = (url: string, { arg }: AddLocationArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/inventory/location`, mutator);
};

const AddLocationModal: FC<Props> = ({ modalOpen, setModalOpen, addOptimisticLocation }) => {
    const { register, reset, handleSubmit, formState: { errors } } = useForm();
    const { trigger: addLocation, isMutating: isAdding } = AddLocation();

    const onSubmit: SubmitHandler<FieldValues> = useCallback(async (data) => {
        addLocation({
            dto: { name: data.inventoryName }
        }).then(async (res) => {
            const location: Inventory = res.data;
            await addOptimisticLocation(location);

            setModalOpen(false);
            reset();
            toast.success(`Successfully created ${data.inventoryName.capitalize()}!`);
        }).catch(e => {
            console.error(e);
            errorToast(e);
        });
    }, [addLocation, addOptimisticLocation, reset, setModalOpen]);

    return (
        <GenericModal
            title="Add a new location"
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <GenericInput
                    register={register}
                    errors={errors}
                    id="inventoryName"
                    label="Inventory Name"
                    placeholder="Enter a name..."
                    isDisabled={isAdding}
                    isRequired
                />
                <GenericButton
                    type="submit"
                    variant="flat"
                    startContent={<PlusCircledIcon />}
                    isDisabled={isAdding}
                    isLoading={isAdding}
                >
                    Create
                </GenericButton>
            </form>
        </GenericModal>
    );
};

export default AddLocationModal;