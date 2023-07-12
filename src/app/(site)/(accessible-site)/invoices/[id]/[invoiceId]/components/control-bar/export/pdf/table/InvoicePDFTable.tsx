"use client";

import { InvoiceItem } from "@prisma/client";
import { StyleSheet, View } from "@react-pdf/renderer";
import InvoicePDFTableHeader from "./InvoicePDFTableHeader";
import InvoicePDFTableRows from "./InvoicePDFTableRows";
import InvoicePDFTableFooter from "./InvoicePDFTableFooter";

type Props = {
    invoiceItems?: InvoiceItem[]
}

const styles = StyleSheet.create({
    tableContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 24,
        borderWidth: 0,
        borderRadius: 8
    }
});

export default function InvoicePDFTable({ invoiceItems }: Props) {
    return (
        <View style={styles.tableContainer}>
            <InvoicePDFTableHeader />
            <InvoicePDFTableRows items={invoiceItems} />
            <InvoicePDFTableFooter items={invoiceItems} />
        </View>
    );
}