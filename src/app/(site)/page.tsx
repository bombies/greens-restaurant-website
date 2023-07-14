"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import close from "/public/icons/close-circled.svg";
import check from "/public/icons/check-green-circled.svg";
import signInIcon from "/public/icons/sign-in.svg";
import { sendToast } from "../../utils/Hooks";
import GenericImage from "../_components/GenericImage";
import GenericInput from "../_components/inputs/GenericInput";
import GenericButton from "../_components/inputs/GenericButton";
import { Spacer } from "@nextui-org/react";

export default function HomePage() {
    const userInfo = useSession();
    const router = useRouter();
    const form = useForm<FieldValues>({
        defaultValues: {
            "email": "",
            "password": ""
        }
    });
    const [isAuthenticating, setAuthenticating] = useState(false);

    useEffect(() => {
        if (userInfo.status === "authenticated")
            router.push("/home");
    }, [userInfo, router]);

    const handleLoginFormSubmit: SubmitHandler<FieldValues> = (data) => {
        setAuthenticating(true);

        signIn(
            "credentials",
            {
                ...data,
                redirect: false
            }
        )
            .then((cb) => {
                if (cb?.error) {
                    sendToast({
                        description: "Invalid credentials! Please check your details and try again.",
                        icon: close
                    });
                } else if (cb?.ok) {
                    sendToast({
                        description: "Logged in!",
                        icon: check
                    });
                }
            })
            .finally(() => {
                setAuthenticating(false);
            });
    };

    return (
        <div
            className="p-12 phone:p-6 flex justify-center min-h-screen"
            style={{
                backgroundImage: "url(\"/images/mesh-bg.png\")",
                backgroundRepeat: "no-repeat"
            }}
        >
            <div
                className="w-96 h-fit bg-neutral-900/50 border-2 border-primary/50 p-16 phone:px-6 rounded-xl tablet:w-3/4 phone:w-full">
                <GenericImage className="mx-auto mb-12" src="https://i.imgur.com/HLTQ78m.png" width={12} />
                <form
                    className="flex flex-col self-center"
                    onSubmit={form.handleSubmit(handleLoginFormSubmit)}
                >
                    <GenericInput
                        register={form.register}
                        required={true}
                        label="Email/Username"
                        id="email"
                        autoComplete="email"
                        disabled={isAuthenticating}
                        placeholder="Enter your email/username"
                    />
                    <Spacer y={1.5} />
                    <GenericInput
                        register={form.register}
                        required={true}
                        label="Password"
                        id="password"
                        type="password"
                        autoComplete="password"
                        disabled={isAuthenticating}
                        placeholder="Enter your password"
                    />
                    <Spacer y={1.5} />
                    <GenericButton
                        size="md"
                        type="submit"
                        disabled={isAuthenticating}
                        isLoading={isAuthenticating}
                        icon={signInIcon}
                        fullWidth
                    >
                        Login
                    </GenericButton>
                </form>
            </div>
        </div>
    );
}