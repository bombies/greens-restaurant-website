import SnapshotsContainer from "./_components/SnapshotsContainer";

type Context = {
    params: {
        name: string
    }
}

export default function InventorySnapshotPage({ params }: Context) {
    return (
        <SnapshotsContainer inventoryName={params.name} />
    );
}