"use client";

import { InvoiceItem } from "@prisma/client";
import { dollarFormat } from "../../../../../../../../../../../utils/GeneralUtils";
import { StyleSheet, View, Text } from "@react-pdf/renderer";

type Props = {
    items?: InvoiceItem[]
}

const borderColor = "#232323";
const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        borderBottomColor: borderColor,
        borderBottomWidth: 1,
        alignItems: "center",
        height: 24,
        fontSize: 12,
        fontStyle: "bold"
    },
    description: {
        width: "85%",
        textAlign: "right",
        borderRightColor: borderColor,
        borderRightWidth: 1,
        paddingRight: 8
    },
    total: {
        width: "15%",
        textAlign: "right",
        paddingRight: 8
    }
});

export default function InvoicePDFTableFooter({ items }: Props) {
    const totalCost = dollarFormat.format(Number(items
        ?.map(item => item.quantity * item.price)
        .reduce((prev, acc) => prev + acc, 0)));

    const totalItems = dollarFormat.format(Number(items
        ?.map(item => item.quantity)
        .reduce((prev, acc) => prev + acc, 0)));

    return (
        <View style={styles.row}>
            <Text style={styles.description}>TOTAL</Text>
            <Text style={styles.total}>{totalCost}</Text>
        </View>
    );
}