"use client";

import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Invoice, InvoiceInformation } from "@prisma/client";

const styles = StyleSheet.create({
    companyImage: {
        width: 128,
        height: 128,
        objectFit: "cover",
        alignSelf: "flex-end",
        marginBottom: 12,
        borderRadius: 16
    },
    header: {
        fontSize: 36,
        marginBottom: 12,
        fontWeight: "black",
        color: "#00D615"
    }
});

type Props = {
    invoice?: Invoice,
    companyInfo?: InvoiceInformation
}

export default function InvoicePDFHeader({ invoice, companyInfo }: Props) {
    return (
        <View style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
        }}>
            <View>
                <Text style={styles.header}>INVOICE</Text>
                <Text style={{
                    fontSize: 24,
                    textTransform: "capitalize",
                    maxWidth: "200"
                }}>{invoice?.title}</Text>
                <Text style={{
                    fontSize: 14,
                    textTransform: "capitalize",
                    maxWidth: "500"
                }}>{invoice?.description}</Text>
                <Text style={{
                    fontSize: 12,
                    textTransform: "capitalize",
                    maxWidth: "200",
                    justifyContent: "flex-end",
                    marginTop: 14
                }}>{companyInfo?.companyName}</Text>
                <Text style={{
                    justifyContent: "flex-end",
                    fontSize: 12,
                    maxWidth: "500"
                }}>{companyInfo?.companyAddress}</Text>
            </View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
                style={styles.companyImage}
                src={companyInfo?.companyLogo || ""}
            />
        </View>
    );
}