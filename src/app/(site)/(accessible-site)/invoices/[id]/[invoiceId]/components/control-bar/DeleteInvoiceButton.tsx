import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { Invoice } from "@prisma/client";

type Props = {
    customerId?: string
    invoice?: Invoice
    disabled: boolean
}

export default function DeleteInvoiceButton({customerId, invoice, disabled}: Props) {
    return (
        <>
            <GenericButton
                color="danger"
                variant="flat"
            >
                Delete Invoice
            </GenericButton>
        </>
    );

}