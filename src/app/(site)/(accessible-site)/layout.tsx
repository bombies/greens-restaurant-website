import React from "react";
import Sidebar from "./_components/Sidebar";

export default function AccessibleSiteLayout(props: React.PropsWithChildren) {
    return (
        <main style={{
            // backgroundImage: 'url("/images/mesh-bg-2.png")',
            // backgroundRepeat: 'no-repeat',
            // backgroundAttachment: 'fixed'
        }}>
            <div className='flex w-full tablet:block'>
                <Sidebar />
                <div className='p-12 phone:px-6 flex-grow tablet:py-20'>
                    {props.children}
                </div>
            </div>
        </main>
    )
}