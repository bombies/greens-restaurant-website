import { FC, useEffect, useState } from "react";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { Invoice, InvoiceCustomer, InvoiceItem } from "@prisma/client";
import useInvoicePDF from "./export/useInvoicePDF";
import { PDFViewer, usePDF } from "@react-pdf/renderer";
import GenericModal from "../../../../../../../_components/GenericModal";
import EyeIcon from "../../../../../../../_components/icons/EyeIcon";

type Props = {
    customer?: InvoiceCustomer
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[]
    disabled: boolean
}

const PreviewInvoiceButton: FC<Props> = ({ customer, invoice, invoiceItems, disabled }) => {
    const { pdf: invoicePdf, companyInfoIsLoading } = useInvoicePDF({ customer, invoice, invoiceItems });
    const [previewVisible, setPreviewVisible] = useState(false);

    return (
        <>
            <GenericModal
                size="5xl"
                scrollBehavior="outside"
                placement="center"
                title="Invoice Preview"
                isOpen={previewVisible}
                onClose={() => setPreviewVisible(false)}

            >
                <div className="h-[80vh]">
                    <PDFViewer
                        showToolbar={false}
                        width="100%"
                        height="100%"
                    >
                        {invoicePdf}
                    </PDFViewer>
                </div>
            </GenericModal>
            <GenericButton
                disabled={disabled || companyInfoIsLoading}
                fullWidth
                variant="flat"
                onPress={() => setPreviewVisible(true)}
            >
                <EyeIcon /> Preview Invoice
            </GenericButton>
        </>

    );
};

export default PreviewInvoiceButton;