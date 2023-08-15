"use client";

import { useEffect, useState } from "react";
import GenericModal from "../../../../../../_components/GenericModal";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import { InvoiceCustomer } from "@prisma/client";
import axios from "axios";
import { UpdateCustomerDto } from "../../../../../../api/invoices/customer/[id]/route";
import useSWRMutation from "swr/mutation";
import ChangesMadeBar from "../../../../employees/[username]/_components/ChangesMadeBar";
import EditableField from "../../../../employees/[username]/_components/EditableField";
import { Spacer } from "@nextui-org/react";
import { CUSTOMER_NAME_REGEX, EMAIL_REGEX } from "../../../../../../../utils/regex";
import { sendToast } from "../../../../../../../utils/Hooks";
import editIconGreen from "/public/icons/edit-green.svg";
import editIcon from "/public/icons/edit.svg";
import IconButton from "../../../../../../_components/inputs/IconButton";

type Props = {
    customer?: InvoiceCustomer,
    disabled?: boolean,
    iconOnly?: boolean,
    onSuccess?: (data: InvoiceCustomer) => void;
}

type UpdateCustomerInfoArgs = {
    arg: {
        dto?: UpdateCustomerDto
    }
}

const UpdateCustomerInfo = (customerId?: string) => {
    const mutator = (url: string, { arg }: UpdateCustomerInfoArgs) => axios.patch(url, arg.dto);
    return useSWRMutation(`/api/invoices/customer/${customerId}`, mutator);
};

export default function EditCustomerButton({ customer, disabled, iconOnly, onSuccess }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [proposedChanges, setProposedChanges] = useState<UpdateCustomerDto>();
    const [changesMade, setChangesMade] = useState(false);
    const { trigger: triggerCustomerUpdate, isMutating: customerIsUpdating } = UpdateCustomerInfo(customer?.id);

    useEffect(() => {
        setChangesMade(!!proposedChanges);
    }, [proposedChanges]);

    return (
        <>
            <GenericModal
                title="Edit Customer Information"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                size="5xl"
            >
                <ChangesMadeBar
                    changesMade={changesMade}
                    isChanging={customerIsUpdating}
                    onAccept={() => {
                        triggerCustomerUpdate({
                            dto: proposedChanges
                        })
                            .then((data) => {
                                setProposedChanges(undefined);
                                setModalOpen(false);
                                sendToast({
                                    description: "Successfully updated this customer!"
                                });

                                if (onSuccess)
                                    onSuccess(data.data);
                            })
                            .catch(e => {
                                console.error(e);
                                sendToast({
                                    error: e,
                                    description: "There was an error updating this customer!"
                                });
                            });
                    }}
                    onReject={() => setProposedChanges(undefined)}
                />
                <div className="space-y-6">
                    <div className="flex phone:flex-col gap-6">
                        <EditableField
                            label="Customer Name"
                            field={proposedChanges?.customerName || customer?.customerName}
                            editAllowed={!disabled}
                            validate={{
                                test(value) {
                                    return CUSTOMER_NAME_REGEX.test(value);
                                },
                                message: "Invalid customer name! It must contain only alphanumeric characters with the exception of the following characters: &, ', (, ), -"
                            }}
                            onValueChange={value => setProposedChanges(prev => ({
                                ...prev,
                                customerName: value
                            }))}
                        />
                        <EditableField
                            label="Customer Email"
                            field={proposedChanges?.customerEmail || customer?.customerEmail}
                            editAllowed={!disabled}
                            validate={{
                                test(value) {
                                    return EMAIL_REGEX.test(value);
                                },
                                message: "Invalid email address!"
                            }}
                            onValueChange={value => setProposedChanges(prev => ({
                                ...prev,
                                customerEmail: value
                            }))}
                        />
                    </div>
                    <EditableField
                        label="Customer Address"
                        field={proposedChanges?.customerAddress || customer?.customerAddress}
                        editAllowed={!disabled}
                        onValueChange={value => setProposedChanges(prev => ({
                            ...prev,
                            customerAddress: value
                        }))}
                    />
                </div>
                <Spacer y={24} />
            </GenericModal>
            {
                iconOnly ?
                    <IconButton
                        icon={editIcon}
                        toolTip="Edit"
                        variant="flat"
                        color="default"
                        onPress={() => setModalOpen(true)}
                    />
                    :
                    <GenericButton
                        variant="flat"
                        onPress={() => setModalOpen(true)}
                        disabled={disabled}
                        icon={editIconGreen}
                    >
                        Edit
                    </GenericButton>
            }
        </>
    );
}