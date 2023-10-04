import React, { FC } from "react";
import { Html, Head, Tailwind, Container, Body, Section, Img, Hr, Text } from "@react-email/components";
import { Button } from "@react-email/button";

type Props = React.PropsWithChildren & GenericEmailProps

export type GenericEmailProps = {
    intendedFor?: string
}

const GenericEmail: FC<Props> = ({ intendedFor, children }) => {
    return (
        <Html>
            <Head />
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                primary: "#00D615",
                                secondary: "#007d0d",
                                danger: "#ff2c2c",
                                warning: "#ffa700"
                            }
                        }
                    }
                }}
            >
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container
                        className="border border-solid border-[#eaeaea] rounded w-[465px] my-20">
                        <Section
                            className="p-6 mb-6"
                            style={{
                                backgroundImage: "linear-gradient(to right, #007d0d, #00D615)"
                            }}
                        >
                            <Button href="https://greensres.ajani.me">
                                <Img
                                    src="https://i.imgur.com/HLTQ78m.png"
                                    width="128"
                                    height="128"
                                    alt="Green's Restaurant & Pub Logo"
                                />
                            </Button>
                        </Section>
                        <Section className="p-6">
                            {children}
                            <Hr className="my-6" />
                            <Section className="text-center text-[#c7c5c5]">
                                {intendedFor && <Text>This email is intended for <span
                                    className="text-secondary">{intendedFor}</span></Text>}
                                <Text>&copy; Green&apos;s Restaurant & Pub, All Rights Reserved.</Text>
                                <Text>Green&apos;s Restaurant & Pub, 41 Lyndhurst Road, Kingston 5, Jamaica.</Text>
                            </Section>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default GenericEmail;