"use client";
import { Invoice, InvoiceCustomer, InvoiceInformation, InvoiceItem } from "@prisma/client";
import ReactPDF, { Document, Page, StyleSheet } from "@react-pdf/renderer";
import InvoicePDFHeader from "./InvoicePDFHeader";
import InvoicePDFRecipient from "./InvoicePDFRecipient";
import InvoicePDFTable from "./table/InvoicePDFTable";
import Font = ReactPDF.Font;

type PDFProps = {
    companyInfo?: InvoiceInformation,
    customerInfo?: InvoiceCustomer,
    invoice?: Invoice,
    invoiceItems?: InvoiceItem[]
}

Font.register({
    family: "Inter",
    fonts: [
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf",
            fontWeight: 100
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf",
            fontWeight: 200
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf",
            fontWeight: 300
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
            fontWeight: 400
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
            fontWeight: 500
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
            fontWeight: 600
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
            fontWeight: 700
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZhrib2Bg-4.ttf",
            fontWeight: 800
        },
        {
            src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf",
            fontWeight: 900
        }
    ],
    format: "truetype"
});

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