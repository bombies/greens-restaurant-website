import SpecificBarSnapshotContext from "./components/SpecificBarSnapshotContext";

type Context = {
    params: {
        time: string
    }
}

export default function BarSnapshotPage({ params }: Context) {
    return (<SpecificBarSnapshotContext time={params.time} />);
}