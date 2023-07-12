"use client";

import { StyleSheet, Text, View } from "@react-pdf/renderer";

const borderColor = "#232323";
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderColor: borderColor,
        backgroundColor: "#191919",
        borderWidth: 1,
        alignItems: "center",
        height: 24,
        textAlign: "center",
        fontStyle: "bold",
        flexGrow: 1,
        borderRadius: 8,
        color: "white",
        textTransform: "uppercase"
    },
    item: {
        width: "20%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    description: {
        width: "30%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    qty: {
        width: "10%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    price: {
        width: "20%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    total: {
        fontSize: "10",
        width: "20%"
    }
});

export default function InvoicePDFTableHeader() {
    return (
        <View style={styles.container}>
            <Text style={styles.item}>Item</Text>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.qty}>Quantity</Text>
            <Text style={styles.price}>Price Per Item</Text>
            <Text style={styles.total}>Total</Text>
        </View>
    );
}