"use client";

import CreateInventoryButton from "./CreateInventoryButton";

type Props = {
    controlsEnabled?: boolean
}

export default function InventoryControlBar({ controlsEnabled }: Props) {
    return (
        <div className="default-container w-5/6 tablet:w-full p-12 phone:px-4 flex gap-4 phone:gap-2">
            <CreateInventoryButton disabled={!controlsEnabled} />
        </div>
    );
}