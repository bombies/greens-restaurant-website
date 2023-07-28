"use client";

import { useEffect, useState } from "react";
import { Invoice } from "@prisma/client";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { UpdateInvoiceDto } from "../../../../../../../api/invoices/customer/[id]/invoice/[invoiceId]/route";
import GenericModal from "../../../../../../../_components/GenericModal";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import ChangesMadeBar from "../../../../../employees/[username]/_components/ChangesMadeBar";
import { sendToast } from "../../../../../../../../utils/Hooks";
import EditableField from "../../../../../employees/[username]/_components/EditableField";
import { Spacer } from "@nextui-org/react";
import editIcon from "/public/icons/edit-green.svg";

type Props = {
    customerId?: string
    invoice?: Invoice
    disabled: boolean
}

type UpdateInvoiceInfoArgs = {
    arg: {
        dto?: UpdateInvoiceDto
    }
}

const UpdateInvoiceInfo = (customerId?: string, invoiceId?: string) => {
    const mutator = (url: string, { arg }: UpdateInvoiceInfoArgs) => axios.patch(url, arg.dto);
    return useSWRMutation(`/api/invoices/customer/${customerId}/invoice/${invoiceId}`, mutator);
};

export default function EditInvoiceButton({ customerId, invoice, disabled }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [proposedChanges, setProposedChanges] = useState<UpdateInvoiceDto>();
    const [changesMade, setChangesMade] = useState(false);
    const {
        trigger: triggerInvoiceInfoUpdate,
        isMutating: invoiceInfoIsUpdating
    } = UpdateInvoiceInfo(customerId, invoice?.id);

    useEffect(() => {
        setChangesMade(!!proposedChanges);
    }, [proposedChanges]);

    return (
        <>
            <GenericModal
                title="Update Invoice Information"
                size="3xl"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <ChangesMadeBar
                    changesMade={changesMade}
                    isChanging={invoiceInfoIsUpdating}
                    onAccept={() => {
                        triggerInvoiceInfoUpdate({
                            dto: proposedChanges
                        })
                            .then(() => {
                                setProposedChanges(undefined);
                                setModalOpen(false);
                                sendToast({
                                    description: "Successfully updated this invoice!"
                                });
                            })
                            .catch(e => {
                                console.error(e);
                                sendToast({
                                    error: e,
                                    description: "There was an error updating this invoice!"
                                });
                            });
                    }}
                    onReject={() => setProposedChanges(undefined)}
                />
                <div className="space-y-6">
                    <EditableField
                        label="Invoice Title"
                        field={proposedChanges?.title || invoice?.title}
                        editAllowed={!disabled}
                        onValueChange={value => setProposedChanges(prev => ({
                            ...prev,
                            title: value
                        }))}
                    />
                    <EditableField
                        label="Invoice Description"
                        field={(proposedChanges?.description || invoice?.description) || undefined}
                        editAllowed={!disabled}
                        onValueChange={value => setProposedChanges(prev => ({
                            ...prev,
                            description: value
                        }))}
                    />
                </div>
                <Spacer y={36} />
            </GenericModal>
            <GenericButton
                variant="flat"
                onPress={() => setModalOpen(true)}
                icon={editIcon}
            >
                Edit Invoice Information
            </GenericButton>
        </>
    );
}