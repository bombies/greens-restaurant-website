import Container from "@/app/_components/Container";
import ReportsIcon from "@/app/_components/icons/ReportsIcon";
import GenericButton from "@/app/_components/inputs/GenericButton";
import SubTitle from "@/app/_components/text/SubTitle";
import Title from "@/app/_components/text/Title";
import { Spacer } from "@nextui-org/react";
import { PackageIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

type Props = {
    visibleButtons: ("my_requests" | "all_requests" | "reports")[]
}

const InventoryRequestsHeader: FC<Props> = ({ visibleButtons }) => {
    return (
        <>
            <Title>Inventory Requests</Title>
            <SubTitle>Create and manage inventory requests</SubTitle>
            <Spacer y={12} />
            <Container className="flex gap-4 w-fit">
                {
                    visibleButtons.includes("my_requests") &&
                    <GenericButton
                        as={Link}
                        href="/inventory/requests"
                        variant="flat"
                        startContent={<UserIcon />}
                    >
                        My Requests
                    </GenericButton>
                }
                {
                    visibleButtons.includes("all_requests") &&
                    <GenericButton
                        as={Link}
                        href="/inventory/requests/all"
                        variant="flat"
                        startContent={<PackageIcon />}
                    >
                        All Requests
                    </GenericButton>
                }
                {
                    visibleButtons.includes("reports") &&
                    <GenericButton
                        as={Link}
                        href="/inventory/requests/reports"
                        variant="flat"
                        startContent={<ReportsIcon />}
                    >
                        Request Reports
                    </GenericButton>
                }
            </Container>
            <Spacer y={6} />
        </>
    )
}

export default InventoryRequestsHeader