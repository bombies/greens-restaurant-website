import axios from "axios";
import SpecificSnapshotContainer from "./_components/SpecificSnapshotContainer";

type Context = {
    params: {
        name: string,
        snapshotId: string,
    }
}

export default async function SpecificInventorySnapshotPage({ params }: Context) {

    return (
        <SpecificSnapshotContainer inventoryName={params.name} snapshotId={params.snapshotId} />
    );
}