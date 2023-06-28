"use client";

import addIcon from "/public/icons/add.svg";
import GenericButton from "../../../../_components/inputs/GenericButton";
import { useEffect, useState } from "react";
import GenericInput from "../../../../_components/inputs/GenericInput";
import GenericModal from "../../../../_components/GenericModal";
import { Spacer } from "@nextui-org/react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { CreateInventoryDto } from "../../../../api/inventory/route";
import { useSession } from "next-auth/react";
import { sendToast } from "../../../../../utils/Hooks";

type Props = {
    disabled?: boolean
}

export const CreateInventory = (dto?: CreateInventoryDto) => {
    const mutator = (url: string) => axios.post(url, dto);
    return useSWRMutation(`/api/inventory`, mutator);
};

export default function CreateInventoryButton({disabled}: Props) {
    const session = useSession();
    const [modalOpen, setModalOpen] = useState(false);
    const [dto, setDto] = useState<CreateInventoryDto>();
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();
    const { trigger: triggerCreateInventory, isMutating: creatingInventory } = CreateInventory(dto);

    useEffect(() => {
        if (!dto || disabled || creatingInventory)
            return;

        triggerCreateInventory()
            .then(() => {
                sendToast({
                    description: "Successfully created that category!"
                }, {
                    position: "top-center"
                });
                setModalOpen(false);
            })
            .catch(e => {
                sendToast({
                    error: e,
                    description: "Could not create that category!" // Fallback
                }, {
                    position: "top-center"
                });
            });
    }, [dto, triggerCreateInventory]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const { name } = data;
        setDto({
            name,
            createdBy: session.data?.user?.id
        });
    };

    return (
        <>
            <GenericButton
                shadow
                icon={addIcon}
                disabled={disabled}
                size="md"
                onClick={() => setModalOpen(true)}
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
                            loading={creatingInventory}
                            shadow
                        >
                            Create
                        </GenericButton>
                    </form>
                </div>
            </GenericModal>
        </>
    );
}