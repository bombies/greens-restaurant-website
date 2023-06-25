import Inventory from "./_components/Inventory";

type Context = {
    params: {
        name: string
    }
}

export default function SpecificInventoryPage({ params }: Context) {
    return (
        <>
            <Inventory name={params.name} />
        </>
    );
}