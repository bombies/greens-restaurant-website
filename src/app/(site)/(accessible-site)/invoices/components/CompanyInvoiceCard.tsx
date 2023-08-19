"use client";

import useSWR from "swr";
import { fetcher } from "../../employees/_components/EmployeeGrid";
import { InvoiceInformation } from "@prisma/client";
import { Skeleton, Spacer } from "@nextui-org/react";
import { Avatar } from "@nextui-org/avatar";
import EditableField from "../../employees/[username]/_components/EditableField";
import { COMPANY_NAME_REGEX } from "../../../../../utils/regex";
import { CldUploadButton } from "next-cloudinary";
import { UpdateCompanyInformationDto } from "../../../../api/invoices/company/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useEffect, useState } from "react";
import ChangesMadeBar from "../../employees/[username]/_components/ChangesMadeBar";
import SubTitle from "../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../utils/Hooks";
import { useAvatar, useCompanyAvatar } from "../../account/components/hooks/useAvatar";
import { useS3Url } from "../../../../_components/hooks/useS3Url";
import { compare } from "../../../../../utils/GeneralUtils";

type Props = {
    controlsEnabled: boolean
}

export const FetchCompanyInfo = () => {
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
    const { component: avatarComponent } = useCompanyAvatar(proposedCompanyInfo, setProposedCompanyInfo);
    const { avatar: companyAvatar } = useS3Url(data?.companyAvatar);

    useEffect(() => {
        if (!isLoading && data)
            setProposedCompanyInfo(data);
    }, [data, isLoading]);

    useEffect(() => {
        if (isLoading || !data)
            return;
        setChangesMade(!compare(proposedCompanyInfo, data));
    }, [data, isLoading, proposedCompanyInfo]);

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
                            toast.success("You have successfully updated the company's invoice information!");
                        })
                        .catch(e => {
                            console.error(e);
                            errorToast(e, "There was an error updating the company's invoice information!");
                        });
                }}
                onReject={() => setProposedCompanyInfo(undefined)}
            />
            <div className="default-container p-12 phone:px-3 w-[50%] tablet:w-full h-fit">
                {
                    <>
                        <SubTitle>Company Information</SubTitle>
                        <Divider className="my-6" />
                        <div className="flex gap-6 phone:flex-col-reverse">
                            <div className="w-1/2 phone:w-full self-center">
                                <EditableField
                                    label="Company Name"
                                    editAllowed={controlsEnabled}
                                    field={proposedCompanyInfo?.companyName || data?.companyName}
                                    fieldIsLoaded={!isLoading}
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
                            {
                                controlsEnabled ?
                                    avatarComponent
                                    :
                                    <Skeleton isLoaded={!isLoading} className={clsx(
                                        "rounded-full w-36 h-36 flex items-center justify-center",
                                        !isLoading && "!bg-transparent"
                                    )}>
                                        <Avatar
                                            isBordered
                                            className="self-center mx-auto w-32 h-32"
                                            src={companyAvatar || (data?.companyLogo || undefined)}
                                        />
                                    </Skeleton>
                            }
                        </div>
                        <Spacer y={6} />
                        <EditableField
                            label="Company Address"
                            textArea
                            editAllowed={controlsEnabled}
                            field={proposedCompanyInfo?.companyAddress || data?.companyAddress}
                            fieldIsLoaded={!isLoading}
                            capitalizeField
                            onValueChange={(value) => {
                                setProposedCompanyInfo(prev => ({
                                    ...prev,
                                    companyAddress: value
                                }));
                            }}
                        />
                        <Spacer y={6} />
                        <EditableField
                            textArea
                            label="Terms & Conditions"
                            editAllowed={controlsEnabled}
                            field={proposedCompanyInfo?.termsAndConditions || data?.termsAndConditions}
                            fieldIsLoaded={!isLoading}
                            capitalizeField
                            onValueChange={(value) => {
                                setProposedCompanyInfo(prev => ({
                                    ...prev,
                                    termsAndConditions: value
                                }));
                            }}
                        />
                    </>
                } </div>
        </>
    );
}