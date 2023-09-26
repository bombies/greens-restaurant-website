import React from "react";
import Sidebar from "./_components/Sidebar";

export default function AccessibleSiteLayout(props: React.PropsWithChildren) {
    return (
        <main className="flex w-full">
            <Sidebar />
            <div className="p-12 phone:px-6 grow tablet:py-20">
                {props.children}
            </div>
        </main>
    );
}