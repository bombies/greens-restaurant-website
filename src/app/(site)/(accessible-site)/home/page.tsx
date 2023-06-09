"use client";

import { useSession } from "next-auth/react";
import ManageInventoryQuickAction from "./_components/quick-actions/ManageInventoryQuickAction";
import AddUsersQuickAction from "./_components/quick-actions/AddUsersQuickAction";
import CreateInvoiceQuickAction from "./_components/quick-actions/CreateInvoiceQuickAction";
import ManageWebsiteQuickAction from "./_components/quick-actions/ManageWebsiteQuickAction";
import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";

export default function HomePage() {
    const user = useSession();

    return (
        <div>
            <Title>Welcome back, <span className="text-primary">{user.data?.user?.firstName || "Unknown"}</span></Title>
            <SubTitle>Let&apos;s get to work</SubTitle>
            <div className={'w-3/4 phone:w-5/6 mt-12 p-12 phone:p-6 default-container'}>
                <h4 className='font-light text-xl phone:text-lg tracking-widest uppercase mb-12 phone:mb-6 phone:text-center'>Quick Actions</h4>
                <div className='grid grid-cols-4 tablet:grid-cols-3 phone:grid-cols-1 gap-x-6 gap-y-10 tablet:place-items-center'>
                    <ManageInventoryQuickAction />
                    <AddUsersQuickAction />
                    <CreateInvoiceQuickAction />
                    <ManageWebsiteQuickAction />
                </div>
            </div>
            <div className="flex flex-col gap-8">

            </div>
        </div>
    );
}