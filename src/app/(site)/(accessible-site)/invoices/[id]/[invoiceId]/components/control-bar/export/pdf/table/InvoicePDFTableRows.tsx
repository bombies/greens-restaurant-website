"use client";

import { InvoiceItem } from "@prisma/client";
import { Fragment } from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { dollarFormat } from "../../../../../../../../../../../utils/GeneralUtils";

const borderColor = "#000000";
const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        borderBottomColor: borderColor,
        borderBottomWidth: 1,
        alignItems: "center",
        minHeight: 24,
    },
    item: {
        fontFamily: "Inter",
        width: "20%",
        textAlign: "left",
        fontSize: "10",
        paddingRight: 8
    },
    description: {
        fontFamily: "Inter",
        width: "30%",
        fontSize: "10",
        textAlign: "left",
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    qty: {
        fontFamily: "Inter",
        width: "10%",
        fontSize: "10",
        paddingHorizontal: 8,
        textAlign: "right"
    },
    price: {
        fontFamily: "Inter",
        width: "20%",
        fontSize: "10",
        paddingHorizontal: 8,
        textAlign: "right"
    },
    total: {
        fontFamily: "Inter",
        fontSize: "10",
        textAlign: "right",
        width: "20%",
        paddingLeft: 8
    }
});

type Props = {
    items?: InvoiceItem[]
}

export default function InvoicePDFTableRows({ items }: Props) {
    const rows = items?.map(item => (
        <View style={styles.row} key={item.id}>
            <Text style={styles.item}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.qty}>{item.quantity}</Text>
            <Text style={styles.price}>{dollarFormat.format(item.price)}</Text>
            <Text style={styles.total}>{dollarFormat.format(item.price * item.quantity)}</Text>
        </View>
    ));

    return (
        <Fragment>
            {rows}
        </Fragment>
    );
}