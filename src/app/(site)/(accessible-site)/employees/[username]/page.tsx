import Title from "../../../../_components/text/Title";
import Employee from "./_components/Employee";
import { Spacer } from "@nextui-org/spacer";
import { getServerSession } from "next-auth";
import { authHandler } from "../../../../api/auth/[...nextauth]/route";

type Context = {
    params: {
        username: string
    }
}

export default async function SpecificEmployeePage({ params }: Context) {
    const session = await getServerSession(authHandler);

    return (
        <div>
            <Title>Employee - <span
                className="text-primary">{`${params.username}${session?.user?.username === params.username ? " (You)" : ""}`}</span></Title>
            <Spacer y={12} />
            <Employee username={params.username} />
        </div>
    );
}