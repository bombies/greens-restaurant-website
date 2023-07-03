import InventoryStockGraph from "./_components/InventoryStockGraph";

type Context = {
    params: {
        name: string
    }
}

export default function SpecificInventoryInsightsPage({params}: Context) {
    return (
        <>
            <div className="default-container p-12 grid grid-cols-1 gap-6">
                <InventoryStockGraph inventoryName={params.name} />
            </div>
        </>
    )
}