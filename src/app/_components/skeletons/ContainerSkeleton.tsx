import { Skeleton, Spacer } from "@nextui-org/react";

type Props = {
    width?: string,
    contentRepeat?: number,
    innerContentRepeat?: number,
}

export default function ContainerSkeleton({ width, contentRepeat, innerContentRepeat }: Props) {
    const content = Array(contentRepeat || 1).fill(
        <div className="flex flex-col default-container p-6 gap-y-2">
            {
                Array(innerContentRepeat || 1).fill(
                    <>
                        <Skeleton className="rounded-2xl w-[20%] h-6" />
                        <Spacer y={2} />
                        <Skeleton className="rounded-2xl w-3/4 h-3" />
                        <Skeleton className="rounded-2xl w-[60%] h-3" />
                        <Skeleton className="rounded-2xl w-[65%] h-3" />
                        <Skeleton className="rounded-2xl w-[40%] h-3" />
                    </>
                )
            }
            <Spacer y={6} />
        </div>
    );

    return (
        <div
            className="default-container p-12"
            style={{
                width: width || "100%"
            }}
        >
            {content}
        </div>
    );
}