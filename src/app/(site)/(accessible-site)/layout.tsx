import React from "react";
import Sidebar from "./_components/Sidebar";

export default function AccessibleSiteLayout(props: React.PropsWithChildren) {
    return (
        <div className="flex min-h-screen">
            <aside>
                <Sidebar />
            </aside>
            <main className="w-[90%] tablet:w-full px-6 phone:px-2 pt-12 phone:pt-16">
                {props.children}
            </main>
        </div>

    );
}