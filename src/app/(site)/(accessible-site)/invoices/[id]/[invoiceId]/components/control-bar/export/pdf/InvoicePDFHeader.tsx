"use client";

import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Invoice, InvoiceInformation, InvoiceType } from "@prisma/client";
import { formatInvoiceNumber } from "../../../../../../utils/invoice-utils";
import { useS3Base64String } from "../../../../../../../../../_components/hooks/useS3Base64String";
import { invoiceTypeAsString } from "../../../../../../utils";

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
        alignSelf: "center",
        marginBottom: 12,
        fontFamily: "Inter",
        fontWeight: 900,
        color: "#00D615"
    }
});

type Props = {
    invoice?: Invoice,
    companyInfo?: InvoiceInformation
}

export default function InvoicePDFHeader({ invoice, companyInfo }: Props) {
    const { avatar } = useS3Base64String(companyInfo?.companyAvatar && `images/company/${companyInfo.companyAvatar}`);
    const typeAsString = invoiceTypeAsString(invoice)

    return (
        <View style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
        }}>
            <View>
                <View style={{ display: "flex", flexDirection: "row", gap: 16 }}>
                    <Text style={styles.header}>
                        {typeAsString.toUpperCase()}
                    </Text>
                    {
                        invoice?.paid &&
                        <View style={{
                            display: "flex",
                            justifyContent: "center",
                            position: "absolute",
                            left: 150,
                            top: 100,
                            borderWidth: 5,
                            borderRadius: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 32,
                            transform: "rotate(-10deg)",
                            width: 200,
                            borderColor: "#a50000"
                        }}>
                            <Text style={{
                                fontFamily: "Inter",
                                margin: 0,
                                padding: 0,
                                fontWeight: 900,
                                fontSize: 36,
                                textAlign: "center",
                                alignSelf: "center",
                                color: "#a50000"
                            }}>PAID</Text>
                        </View>
                    }
                </View>
                <Text style={{
                    fontFamily: "Inter",
                    fontSize: 24,
                    textTransform: "capitalize",
                    maxWidth: "200"
                }}>{typeAsString} #{formatInvoiceNumber(invoice?.number ?? 0)}</Text>
                <Text style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    textTransform: "capitalize",
                    maxWidth: "500"
                }}>{invoice?.description}</Text>
                <Text style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    textTransform: "capitalize",
                    maxWidth: "200",
                    justifyContent: "flex-end",
                    marginTop: 14
                }}>{companyInfo?.companyName}</Text>
                <Text style={{
                    fontFamily: "Inter",
                    justifyContent: "flex-end",
                    fontSize: 12,
                    maxWidth: "500"
                }}>{companyInfo?.companyAddress}</Text>
            </View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
                style={styles.companyImage}
                src={avatar || (companyInfo?.companyLogo || "")}
            />
        </View>
    );
}