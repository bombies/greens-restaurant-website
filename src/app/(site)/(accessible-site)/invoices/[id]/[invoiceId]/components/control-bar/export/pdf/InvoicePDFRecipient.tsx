"use client";

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { InvoiceCustomer, InvoiceInformation } from "@prisma/client";

type Props = {
    customerInfo?: InvoiceCustomer
    companyInfo?: InvoiceInformation
    invoiceCreationDate?: Date
}

const styles = StyleSheet.create({
    headerView: {
        display: "flex",
        flexDirection: "row",
        gap: "16",
        justifyContent: "space-between"
    },
    companyInfo: {
        padding: 12,
    }
});

export default function InvoicePDFRecipient({ customerInfo, companyInfo, invoiceCreationDate }: Props) {
    return (
        <View style={styles.headerView}>
            <View>
                <Text style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 6,
                    color: "#007d0d"
                }}>BILLED TO</Text>
                <Text style={{
                    fontSize: 12,
                    textTransform: "capitalize",
                    maxWidth: "200",
                    justifyContent: "flex-start"
                }}>{customerInfo?.customerName}</Text>
                <Text style={{
                    justifyContent: "flex-end",
                    fontSize: 12,
                    maxWidth: "500"
                }}>{customerInfo?.customerAddress}</Text>
            </View>
            <View>
                <Text style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 6,
                    color: "#007d0d"
                }}>INVOICE DATE</Text>
                <Text style={{
                    fontSize: 12,
                    textTransform: "capitalize",
                    maxWidth: "200",
                    justifyContent: "flex-start"
                }}>{invoiceCreationDate?.toDateString()}</Text>
            </View>
        </View>
    );
}