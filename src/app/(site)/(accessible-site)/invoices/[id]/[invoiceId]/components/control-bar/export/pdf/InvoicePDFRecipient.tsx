"use client";

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { InvoiceCustomer, InvoiceInformation } from "@prisma/client";
import { formatDateDDMMYYYY } from "../../../../../../components/invoice-utils";

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
        padding: 12
    }
});

export default function InvoicePDFRecipient({ customerInfo, companyInfo, invoiceCreationDate }: Props) {
    return (
        <View style={styles.headerView}>
            <View>
                <Text style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 6,
                    marginTop: 12,
                    color: "#007d0d"
                }}>BILLED TO</Text>
                <Text style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    textTransform: "capitalize",
                    maxWidth: "200",
                    justifyContent: "flex-start"
                }}>{customerInfo?.customerName}</Text>
                {
                    customerInfo?.customerDescription &&
                    <Text style={{
                        fontFamily: "Inter",
                        fontSize: 12,
                        textTransform: "capitalize",
                        maxWidth: "75%",
                        justifyContent: "flex-start"
                    }}>
                        {customerInfo?.customerDescription}
                    </Text>
                }
                <Text style={{
                    fontFamily: "Inter",
                    justifyContent: "flex-end",
                    fontSize: 12,
                    maxWidth: "75%"
                }}>{customerInfo?.customerAddress}</Text>
            </View>
            <View>
                <Text style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 6,
                    color: "#007d0d"
                }}>INVOICE DATE</Text>
                <Text style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    textTransform: "capitalize",
                    maxWidth: "200",
                    justifyContent: "flex-start"
                }}>{invoiceCreationDate ? formatDateDDMMYYYY(invoiceCreationDate) : "Unknown"}</Text>
            </View>
        </View>
    );
}