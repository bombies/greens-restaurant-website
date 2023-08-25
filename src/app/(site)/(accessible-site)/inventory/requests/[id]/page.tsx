import SpecificRequestContainer from "./components/SpecificRequestContainer";

type Context = {
    params: {
        id: string
    }
}

export default function SpecificRequestPage({ params }: Context) {
    return (
        <SpecificRequestContainer id={params.id} />
    );
}