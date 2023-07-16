"use client";

import Title from "./_components/text/Title";
import SubTitle from "./_components/text/SubTitle";
import { useRouter } from "next/navigation";
import GenericButton from "./_components/inputs/GenericButton";
import { Link } from "@nextui-org/react";
import homeIcon from "/public/icons/home.svg";
import backIcon from "/public/icons/back-green.svg";
import GenericImage from "./_components/GenericImage";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <div className="flex justify-center">
                <Link href="/home">
                    <GenericImage src="https://i.imgur.com/HLTQ78m.png" width={18} />
                </Link>
            </div>
            <div className="default-container p-12">
                <Title className="text-center text-primary">404</Title>
                <SubTitle className="text-center" thick>The page you were looking for doesn&apos;t exist!</SubTitle>
            </div>
            <div className="flex gap-4 mt-12">
                <GenericButton
                    href="/home"
                    as={Link}
                    icon={homeIcon}
                >
                    Go home
                </GenericButton>
                <GenericButton
                    variant="flat"
                    onPress={() => router.back()}
                    icon={backIcon}
                >
                    Go back
                </GenericButton>
            </div>
        </div>
    );
}