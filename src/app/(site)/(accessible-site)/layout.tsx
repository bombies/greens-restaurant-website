import React from "react";
import Sidebar from "./_components/Sidebar";

export default function AccessibleSiteLayout(props: React.PropsWithChildren) {
    return (
        <main>
            <div className='flex w-full tablet:block'>
                <Sidebar />
                <div className='p-12 phone:px-6 flex-grow tablet:py-20'>
                    {props.children}
                </div>
            </div>
        </main>
    )
}