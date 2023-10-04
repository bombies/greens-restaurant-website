import GenericEmail, { GenericEmailProps } from "./components/GenericEmail";
import { FC } from "react";
import { Heading, Hr, Section, Text } from "@react-email/components";

type Props = {
    firstName: string,
    username: string,
    password: string,
} & GenericEmailProps

const InviteEmail: FC<Props> = ({
                                    firstName = "John",
                                    username = "jdoe",
                                    password = "password",
                                    intendedFor = "jdoe@example.com"
                                }) => {
    return (
        <GenericEmail intendedFor={intendedFor}>
            <Heading>
                Hello <span className="text-primary">{firstName}</span>,
            </Heading>
            <Text>
                Please see the login details below to access your account. Click <a
                href="https://greensres.ajani.me">here</a> to access the website.
            </Text>
            <Hr />
            <Section className="rounded-3xl border border-solid border-[#eaeaea] p-6 mt-6">
                <Text><span className="text-primary font-bold">Username: </span>{username}</Text>
                <Text><span className="text-primary font-bold">Password: </span>{password}</Text>
            </Section>
        </GenericEmail>
    );
};

export default InviteEmail;