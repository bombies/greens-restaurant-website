"use client";

import useSWR from "swr";
import { fetcher } from "../../employees/_components/EmployeeGrid";
import { InvoiceInformation } from "@prisma/client";
import { Spacer } from "@nextui-org/react";
import { Avatar } from "@nextui-org/avatar";
import EditableField from "../../employees/[username]/_components/EditableField";
import { COMPANY_NAME_REGEX } from "../../../../../utils/regex";
import { UpdateCompanyInformationDto } from "../../../../api/invoices/company/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useEffect, useState } from "react";
import ChangesMadeBar from "../../../../_components/ChangesMadeBar";
import SubTitle from "../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../utils/Hooks";
import { useCompanyAvatar } from "../../account/components/hooks/useAvatar";
import { compare } from "../../../../../utils/GeneralUtils";
import { getCompanyAvatarString } from "../utils/invoice-utils";

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
                        .then((res) => {
                            setProposedCompanyInfo(res.data);
                            toast.success("You have successfully updated the company's invoice information!");
                        })
                        .catch(e => {
                            console.error(e);
                            errorToast(e, "There was an error updating the company's invoice information!");
                        });
                }}
                onReject={() => setProposedCompanyInfo(data)}
            />
            <div className="default-container p-6 phone:px-3 w-[30%] tablet:w-full h-fit">
                {
                    <>
                        <SubTitle>Company Information</SubTitle>
                        <Divider className="my-6" />
                        {
                            controlsEnabled ?
                            <div className="flex justify-center">
                                {avatarComponent}
                            </div>
                                :
                                <Avatar
                                    isBordered
                                    className="self-center mx-auto w-32 h-32"
                                    src={getCompanyAvatarString(data)}
                                />
                        }
                        <Spacer y={6} />
                        <div className="w-full self-center">
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