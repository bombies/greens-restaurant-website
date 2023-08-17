"use client";

import { StyleSheet, Text, View } from "@react-pdf/renderer";

const borderColor = "#007d0d";
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderColor: borderColor,
        backgroundColor: "#007d0d",
        borderWidth: 1,
        alignItems: "center",
        height: 24,
        textAlign: "center",
        flexGrow: 1,
        borderRadius: 8,
        color: "white",
        textTransform: "uppercase"
    },
    item: {
        fontFamily: "Inter",
        fontWeight: 600,
        width: "20%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    description: {
        fontFamily: "Inter",
        fontWeight: 600,
        width: "30%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    qty: {
        fontFamily: "Inter",
        fontWeight: 600,
        width: "10%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    price: {
        fontFamily: "Inter",
        fontWeight: 600,
        width: "20%",
        fontSize: "10",
        borderRightColor: borderColor,
        borderRightWidth: 1
    },
    total: {
        fontFamily: "Inter",
        fontWeight: 600,
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