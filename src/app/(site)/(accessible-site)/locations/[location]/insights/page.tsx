import InventoryInsightsContainer from "../../../inventory/[name]/insights/_components/InventoryInsightsContainer";

type Context = {
    params: {
        location: string
    }
}

export default function BarInsightsPage({ params }: Context) {
    return (
        <InventoryInsightsContainer inventoryName={params.location} />
    );
}