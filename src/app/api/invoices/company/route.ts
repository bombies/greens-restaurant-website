import { authenticatedAny, respondWithInit } from "../../../../utils/api/ApiUtils";
import Permission from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { InvoiceInformation } from "@prisma/client";
import { NextResponse } from "next/server";
import { COMPANY_NAME_REGEX } from "../../../../utils/regex";

const defaultInfo: Omit<InvoiceInformation, "createdAt" | "updatedAt" | "id"> = {
    companyName: "green's restaurant & pub",
    companyAddress: "41 Lyndhurst Road, Kingston",
    companyLogo: "",
    termsAndConditions: ""
};

export function GET(req: Request) {
    return authenticatedAny(req, async () => {
        return NextResponse.json(await fetchCompanyInfo());
    }, [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]);
}

export type UpdateCompanyInformationDto = Omit<Partial<InvoiceInformation>, "createdAt" | "updatedAt" | "id">

export function PATCH(req: Request) {
    return authenticatedAny(req, async () => {
        const info = await fetchCompanyInfo();
        const body = (await req.json()) as UpdateCompanyInformationDto;

        let newName: string | undefined = undefined;
        if (body.companyName) {
            if (!COMPANY_NAME_REGEX.test(body.companyName))
                return respondWithInit({
                    message: "Invalid company name! " +
                        "The company name must not be more than 30 characters. " +
                        "It should also not include any special characters. ",
                    status: 401
                });

            newName = body.companyName
                .toLowerCase()
                .trim()
                .replaceAll(/\s{2,}/g, " ");
        }

        return NextResponse.json(await prisma.invoiceInformation.update({
            where: {
                id: info.id
            },
            data: {
                companyName: newName || info.companyName,
                companyLogo: body.companyLogo || info.companyLogo,
                companyAddress: body.companyAddress || info.companyAddress,
                termsAndConditions: body.termsAndConditions || info.termsAndConditions
            }
        }));
    }, [Permission.CREATE_INVOICE]);
}


const fetchCompanyInfo = async (): Promise<InvoiceInformation> => {
    const info = await prisma.invoiceInformation.findFirst();
    if (!info) {
        return prisma.invoiceInformation.create({
            data: defaultInfo
        });
    }
    return info;
};