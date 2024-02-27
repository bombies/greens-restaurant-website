"use client";

import { useEffect, useState } from "react";
import { Invoice } from "@prisma/client";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { UpdateInvoiceDto } from "../../../../../../../api/invoices/customer/[id]/invoice/[invoiceId]/types";
import GenericModal from "../../../../../../../_components/GenericModal";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import ChangesMadeBar from "../../../../../../../_components/ChangesMadeBar";
import { errorToast } from "../../../../../../../../utils/Hooks";
import EditableField, { DataContainer } from "../../../../../employees/[username]/_components/EditableField";
import { Spacer } from "@nextui-org/react";
import editIcon from "/public/icons/edit-green.svg";
import { GenericDatePicker } from "../../../../../../../_components/GenericDatePicker";
import { fetchDueAt } from "../../../../utils/invoice-utils";
import { toast } from "react-hot-toast";
import { KeyedMutator } from "swr";
import { InvoiceWithOptionalItems } from "../../../../../home/_components/widgets/InvoiceWidget";
import { invoiceTypeAsString } from "../../../../utils";

type Props = {
    customerId?: string,
    mutateInvoice: KeyedMutator<InvoiceWithOptionalItems | undefined>
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

export default function EditInvoiceButton({ customerId, invoice, disabled, mutateInvoice }: Props) {
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
                title={`Update ${invoiceTypeAsString(invoice)} Information`}
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
                            .then(async (res) => {
                                const updatedInvoice: InvoiceWithOptionalItems = res.data;

                                await mutateInvoice({
                                    ...invoice,
                                    ...updatedInvoice
                                });

                                setProposedChanges(undefined);
                                setModalOpen(false);
                                toast.success(`Successfully updated this ${invoiceTypeAsString(invoice).toLowerCase()}!`);
                            })
                            .catch(e => {
                                console.error(e);
                                errorToast(e, `There was an error updating this ${invoiceTypeAsString(invoice).toLowerCase()}!`);
                            });
                    }}
                    onReject={() => setProposedChanges(undefined)}
                />
                <div className="space-y-6">
                    <EditableField
                        textArea
                        label={`${invoiceTypeAsString(invoice)} Description`}
                        field={(proposedChanges?.description || invoice?.description) || undefined}
                        editAllowed={!disabled}
                        onValueChange={value => setProposedChanges(prev => ({
                            ...prev,
                            description: value
                        }))}
                    />
                    <DataContainer label={`${invoiceTypeAsString(invoice)} Due At`} editAllowed={false}>
                        <GenericDatePicker
                            value={proposedChanges?.dueAt ?? fetchDueAt(invoice)}
                            onDateChange={(date) => setProposedChanges(prev => {
                                const d = date
                                d?.setHours(23, 59, 59, 999);
                                return ({
                                    ...prev,
                                    dueAt: d
                                })
                            })}
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
                Edit {invoiceTypeAsString(invoice)} Information
            </GenericButton>
        </>
    );
}