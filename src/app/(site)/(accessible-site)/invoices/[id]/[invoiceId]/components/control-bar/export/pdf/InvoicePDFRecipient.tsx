"use client";

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { InvoiceCustomer, InvoiceInformation } from "@prisma/client";

type Props = {
    customerInfo?: InvoiceCustomer
    companyInfo?: InvoiceInformation
}

const styles = StyleSheet.create({
    headerView: {
        display: "flex",
        gap: "16",
        justifyContent: "space-between"
    },
    companyInfo: {
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgb(0,0,0)"
    }
});

export default function InvoicePDFRecipient({ customerInfo, companyInfo }: Props) {
    return (
        <View style={styles.headerView}>
            <View style={styles.companyInfo}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 12
                }}>BILLED TO</Text>
                <Text style={{
                    fontSize: 16,
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
            <View style={styles.companyInfo}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 12
                }}>PAY TO</Text>
                <Text style={{
                    fontSize: 16,
                    textTransform: "capitalize",
                    maxWidth: "200",
                    justifyContent: "flex-end"
                }}>{companyInfo?.companyName}</Text>
                <Text style={{
                    justifyContent: "flex-end",
                    fontSize: 12,
                    maxWidth: "500"
                }}>{companyInfo?.companyAddress}</Text>
            </View>
        </View>
    );
}