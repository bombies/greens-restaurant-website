"use client";
import { Invoice, InvoiceCustomer, InvoiceInformation, InvoiceItem } from "@prisma/client";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import InvoicePDFHeader from "./InvoicePDFHeader";
import InvoicePDFRecipient from "./InvoicePDFRecipient";
import InvoicePDFTable from "./table/InvoicePDFTable";

type PDFProps = {
    companyInfo?: InvoiceInformation,
    customerInfo?: InvoiceCustomer,
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[]
}

const styles = StyleSheet.create({
    body: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35
    }
});

export default function InvoicePDF({ companyInfo, customerInfo, invoice, invoiceItems }: PDFProps) {
    return (
        <Document>
            <Page size="LETTER" style={styles.body}>
                <InvoicePDFHeader invoice={invoice} companyInfo={companyInfo} />
                <InvoicePDFRecipient
                    companyInfo={companyInfo}
                    customerInfo={customerInfo}
                    invoiceCreationDate={new Date(invoice?.createdAt ?? 0)}
                />
                <InvoicePDFTable
                    invoiceItems={invoiceItems}
                    termsAndConditions={companyInfo?.termsAndConditions ?? undefined}
                />
            </Page>
        </Document>
    );
}