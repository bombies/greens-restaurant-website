"use client";

import { Invoice, InvoiceCustomer, InvoiceInformation, InvoiceItem } from "@prisma/client";
import { Document, Page, StyleSheet, Text, View, Font, Image } from "@react-pdf/renderer";
import InvoicePDFHeader from "./InvoicePDFHeader";
import InvoicePDFRecipient from "./InvoicePDFRecipient";
import InvoicePDFTable from "./table/InvoicePDFTable";

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
        paddingBottom: 150,
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
                    invoiceType={invoice?.type}
                    invoiceCreationDate={new Date(invoice?.createdAt ?? 0)}
                />
                <InvoicePDFTable
                    invoiceItems={invoiceItems}
                    termsAndConditions={companyInfo?.termsAndConditions ?? undefined}
                />
                {
                    companyInfo?.termsAndConditions &&
                    <View
                        style={{
                            position: "absolute",
                            bottom: 40,
                            left: 35
                        }}
                        fixed
                    >
                        <Text style={{
                            fontFamily: "Inter",
                            fontSize: 14,
                            fontWeight: "bold",
                            marginBottom: 6,
                            color: "#007d0d"
                        }}>TERMS &amp; CONDITIONS</Text>
                        <Text style={{
                            fontFamily: "Inter",
                            fontSize: 12
                        }}>
                            {companyInfo.termsAndConditions}
                        </Text>
                    </View>
                }
                {/*<View*/}
                {/*    style={{*/}
                {/*        position: 'absolute',*/}
                {/*        zIndex: -1*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <Image*/}
                {/*        src='/images/mesh-bg-2.png'*/}
                {/*        fixed={true}*/}
                {/*        style={{*/}
                {/*            width: "612px",*/}
                {/*            height: "650px",*/}
                {/*            objectFit: "cover",*/}
                {/*            opacity: 0.2*/}
                {/*        }}*/}
                {/*    />*/}
                {/*</View>*/}
            </Page>
        </Document>
    );
}