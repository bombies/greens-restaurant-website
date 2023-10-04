import { FC } from "react";
import GenericEmail, { GenericEmailProps } from "./components/GenericEmail";
import { Heading, Text } from "@react-email/components";

type Props = {
    firstName: string,
    username: string,
    email: string,
} & GenericEmailProps

const EmailUpdateEmail: FC<Props> = ({
                                         firstName = "John",
                                         username = "jdoe",
                                         email = "new.jdoe@example.com",
                                         intendedFor = email
                                     }) => {
    return (
        <GenericEmail intendedFor={intendedFor}>
            <Heading>
                Hello <span className="text-primary">{firstName}</span>,
            </Heading>
            <Text>Your email for account with username <b>{username}</b> has been updated to this one.
                ({email})</Text>
        </GenericEmail>
    );
};

export default EmailUpdateEmail;