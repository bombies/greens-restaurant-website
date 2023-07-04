import InventoryInsightsContainer from "./_components/InventoryInsightsContainer";

type Context = {
    params: {
        name: string
    }
}

export default function SpecificInventoryInsightsPage({ params }: Context) {
    return (
        <InventoryInsightsContainer inventoryName={params.name} />
    );
}