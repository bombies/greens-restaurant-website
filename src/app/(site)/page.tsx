"use client";

import { signIn, useSession } from "next-auth/react";
import { Button, Input, Loading, Spacer, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function HomePage() {
    const userInfo = useSession();
    const router = useRouter();
    const form = useForm({
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
                    toast.error("Invalid credentials! Please check your details and try again.", {
                        position: 'top-center'
                    })
                } else if (cb?.ok) {
                    toast.success("Logged in!", {
                        position: 'top-center'
                    })
                }
            })
            .finally(() => {
                setAuthenticating(false);
            });
    };

    return (
        <div className="p-12 phone:p-6 flex justify-center">
            <div className="w-96 bg-neutral-900/25 border-2 border-primary/50 p-16 phone:px-6 rounded-xl tablet:w-3/4 phone:w-full">
                <form
                    className="flex flex-col"
                    onSubmit={form.handleSubmit(handleLoginFormSubmit)}
                >
                    <Input
                        {...form.register("email", { required: true })}
                        id="email"
                        autoComplete="email"
                        disabled={isAuthenticating}
                        labelPlaceholder="Email/Username"
                    />
                    <Spacer y={2.5} />
                    <Input.Password
                        {...form.register("password", { required: true })}
                        id="password"
                        autoComplete="password"
                        disabled={isAuthenticating}
                        labelPlaceholder="Password"
                    />
                    <Spacer y={1.5} />
                    <Button
                        type="submit"
                        disabled={isAuthenticating}
                        shadow
                    >
                        {isAuthenticating ? <Loading color='white' size='sm' /> : "Login"}
                    </Button>
                </form>
            </div>
        </div>
    );
}