import SpecificLocationSnapshotContext from "./components/SpecificLocationSnapshotContext";

type Context = {
    params: {
        time: string
    }
}

export default function BarSnapshotPage({ params }: Context) {
    return (<SpecificLocationSnapshotContext time={params.time} />);
}