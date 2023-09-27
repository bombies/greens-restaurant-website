"use client";

import addIcon from "/public/icons/add.svg";
import GenericButton from "../../../../_components/inputs/GenericButton";
import { useState } from "react";
import GenericInput from "../../../../_components/inputs/GenericInput";
import GenericModal from "../../../../_components/GenericModal";
import { Spacer } from "@nextui-org/react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../utils/Hooks";
import { CreateInventoryDto } from "../../../../api/inventory/[name]/types";

type Props = {
    disabled?: boolean
}

type CreateInventoryArgs = {
    arg: {
        dto: CreateInventoryDto
    }
}

export const CreateInventory = () => {
    const mutator = (url: string, { arg }: CreateInventoryArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/inventory`, mutator);
};

export default function CreateInventoryButton({ disabled }: Props) {
    const session = useSession();
    const [modalOpen, setModalOpen] = useState(false);
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();
    const { trigger: triggerCreateInventory, isMutating: creatingInventory } = CreateInventory();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const { name } = data;
        triggerCreateInventory({
            dto: {
                name,
                createdBy: session.data?.user?.id
            }
        })
            .then(() => {
                toast.success("Successfully created that inventory");
                setModalOpen(false);
            })
            .catch(e => {
                errorToast(e, "Could not create that inventory!");
            });
    };

    return (
        <>
            <GenericButton
                icon={addIcon}
                disabled={disabled}
                size="md"
                onPress={() => setModalOpen(true)}
            >
                Create New Inventory
            </GenericButton>
            <GenericModal
                title="Create New Inventory"
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                }}
            >
                <div className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <GenericInput
                            maxLength={30}
                            isClearable
                            register={register}
                            errors={errors}
                            disabled={creatingInventory || disabled}
                            label="Inventory Name"
                            id="name"
                            required
                        />
                        <Spacer y={6} />
                        <GenericButton
                            type="submit"
                            icon={addIcon}
                            disabled={creatingInventory || disabled}
                            isLoading={creatingInventory}
                        >
                            Create
                        </GenericButton>
                    </form>
                </div>
            </GenericModal>
        </>
    );
}