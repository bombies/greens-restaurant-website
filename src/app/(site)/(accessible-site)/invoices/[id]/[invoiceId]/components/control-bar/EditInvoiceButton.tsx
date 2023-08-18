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
import EditableField, { DataContainer } from "../../../../../employees/[username]/_components/EditableField";
import { Spacer } from "@nextui-org/react";
import editIcon from "/public/icons/edit-green.svg";
import { GenericDatePicker } from "../../../../../../../_components/GenericDatePicker";
import { fetchDueAt } from "../../../../components/invoice-utils";

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
                        textArea
                        label="Invoice Description"
                        field={(proposedChanges?.description || invoice?.description) || undefined}
                        editAllowed={!disabled}
                        onValueChange={value => setProposedChanges(prev => ({
                            ...prev,
                            description: value
                        }))}
                    />
                    <DataContainer label="Invoice Due At" editAllowed={false}>
                        <GenericDatePicker
                            id="invoice_due_at"
                            value={proposedChanges?.dueAt ?? fetchDueAt(invoice)}
                            onDateChange={(date) => setProposedChanges(prev => ({
                                ...prev,
                                dueAt: date
                            }))}
                            min={invoice && new Date(invoice?.createdAt.toString())}
                        />
                    </DataContainer>
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