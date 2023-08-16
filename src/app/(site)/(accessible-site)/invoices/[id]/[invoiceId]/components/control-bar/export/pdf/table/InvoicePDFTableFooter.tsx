"use client";

import { InvoiceItem } from "@prisma/client";
import { dollarFormat } from "../../../../../../../../../../../utils/GeneralUtils";
import { StyleSheet, View, Text } from "@react-pdf/renderer";
import { Fragment } from "react";

type Props = {
    items?: InvoiceItem[],
    termsAndConditions?: String
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

export default function InvoicePDFTableFooter({ items, termsAndConditions }: Props) {
    const totalCost = dollarFormat.format(Number(items
        ?.map(item => item.quantity * item.price)
        .reduce((prev, acc) => prev + acc, 0)));

    const totalItems = dollarFormat.format(Number(items
        ?.map(item => item.quantity)
        .reduce((prev, acc) => prev + acc, 0)));

    return (
        <View>
            <View style={styles.row}>
                <Text style={styles.description}>TOTAL</Text>
                <Text style={styles.total}>{totalCost}</Text>
            </View>
            <View style={{
                display: 'flex',
                marginTop: 24,
            }}>
                {
                    termsAndConditions &&
                    <Fragment>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            marginBottom: 6,
                            color: "#007d0d"
                        }}>TERMS &amp; CONDITIONS</Text>
                        <Text style={{
                            fontSize: 12
                        }}>
                            {termsAndConditions}
                        </Text>
                    </Fragment>
                }
            </View>
        </View>

    );
}