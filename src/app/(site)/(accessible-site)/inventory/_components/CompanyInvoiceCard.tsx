"use client";

import useSWR from "swr";
import { fetcher } from "../../employees/_components/EmployeeGrid";
import { InvoiceInformation } from "@prisma/client";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/react";
import { Avatar } from "@nextui-org/avatar";
import EditableField from "../../employees/[username]/_components/EditableField";
import { COMPANY_NAME_REGEX } from "../../../../../utils/regex";
import { CldUploadButton } from "next-cloudinary";
import { UpdateCompanyInformationDto } from "../../../../api/invoices/company/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useEffect, useState } from "react";
import ChangesMadeBar from "../../employees/[username]/_components/ChangesMadeBar";
import { sendToast } from "../../../../../utils/Hooks";
import SubTitle from "../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";

type Props = {
    controlsEnabled?: boolean
}

const FetchCompanyInfo = () => {
    return useSWR("/api/invoices/company", fetcher<InvoiceInformation>);
};

type UpdateCompanyInfoArgs = {
    arg: {
        dto?: UpdateCompanyInformationDto
    }
}

const UpdateCompanyInfo = () => {
    const mutator = (url: string, { arg }: UpdateCompanyInfoArgs) => axios.patch(url, arg.dto);
    return useSWRMutation("/api/invoices/company", mutator);
};

export default function CompanyInvoiceCard({ controlsEnabled }: Props) {
    const { data, isLoading } = FetchCompanyInfo();
    const { trigger: triggerCompanyInfoUpdate, isMutating: infoIsUpdating } = UpdateCompanyInfo();
    const [proposedCompanyInfo, setProposedCompanyInfo] = useState<UpdateCompanyInformationDto>();
    const [changesMade, setChangesMade] = useState(false);

    useEffect(() => {
        setChangesMade(!!proposedCompanyInfo);
    }, [proposedCompanyInfo]);

    const handleImageUpload = (result: any) => {
        const url = result?.info?.secure_url;
        setProposedCompanyInfo(prev => ({
            ...prev,
            companyLogo: url
        }));
    };

    return (
        <>
            <ChangesMadeBar
                changesMade={changesMade}
                isChanging={infoIsUpdating}
                onAccept={() => {
                    triggerCompanyInfoUpdate({
                        dto: proposedCompanyInfo
                    })
                        .then(() => {
                            setProposedCompanyInfo(undefined);
                            sendToast({
                                description: "You have successfully updated the company's invoice information!"
                            });
                        })
                        .catch(e => {
                            console.error(e);
                            sendToast({
                                error: e,
                                description: "There was an error updating the company's invoice information!"
                            });
                        });
                }}
                onReject={() => setProposedCompanyInfo(undefined)}
            />
            <div className="default-container p-12 phone:px-3 w-[50%] phone:w-full h-fit">
                {
                    isLoading ?
                        <div className="flex justify-center">
                            <Spinner size="lg" />
                        </div>
                        :
                        <>
                            <SubTitle>Company Information</SubTitle>
                            <Divider className="my-6" />
                            <div className="flex gap-6 phone:flex-col-reverse">
                                <div className="w-1/2 phone:w-full self-center">
                                    <EditableField
                                        label="Company Name"
                                        editAllowed={controlsEnabled || true}
                                        field={proposedCompanyInfo?.companyName || data?.companyName}
                                        capitalizeField
                                        validate={{
                                            test(value) {
                                                return COMPANY_NAME_REGEX.test(value);
                                            },
                                            message: "Invalid company name! It must contain only alphanumeric characters with the exception of the following characters: &, ', (, ), -"
                                        }}
                                        onValueChange={(value) => {
                                            setProposedCompanyInfo(prev => ({
                                                ...prev,
                                                companyName: value
                                            }));
                                        }}
                                    />
                                </div>
                                <CldUploadButton
                                    options={{
                                        maxFiles: 1,
                                        maxFileSize: 3000000,
                                        resourceType: "image"
                                    }}
                                    onUpload={handleImageUpload}
                                    uploadPreset="kyyplgrx"
                                >
                                    <Avatar
                                        isBordered={true}
                                        className="self-center mx-auto transition-fast hover:brightness-150 cursor-pointer w-32 h-32"
                                        src={(proposedCompanyInfo?.companyLogo || data!.companyLogo) || undefined}
                                    />
                                </CldUploadButton>
                            </div>
                            <Spacer y={6} />
                            <EditableField
                                label="Company Address"
                                editAllowed={controlsEnabled || true}
                                field={proposedCompanyInfo?.companyAddress || data?.companyAddress}
                                capitalizeField
                                onValueChange={(value) => {
                                    setProposedCompanyInfo(prev => ({
                                        ...prev,
                                        companyAddress: value
                                    }));
                                }}
                            />
                        </>
                } </div>
        </>
    );
}