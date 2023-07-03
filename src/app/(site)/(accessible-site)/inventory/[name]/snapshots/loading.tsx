import CardSkeleton from "../../../../../_components/skeletons/CardSkeleton";

export default function LoadingPage() {
    return (
        <div className="default-container p-12">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
    );
}