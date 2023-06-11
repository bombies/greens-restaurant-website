import Title from "../../../../_components/text/Title";
import Employee from "./_components/Employee";
import { Spacer } from "@nextui-org/spacer";

type Context = {
    params: {
        username: string
    }
}

export default async function SpecificEmployeePage({ params }: Context) {

    return (
        <div>
            <Title>Employee - <span className="text-primary">{params.username}</span></Title>
            <Spacer y={12} />
            <Employee username={params.username} />
        </div>
    );
}