"use client";

import { useSession } from "next-auth/react";
import ManageInventoryQuickAction from "./_components/quick-actions/ManageInventoryQuickAction";
import AddUsersQuickAction from "./_components/quick-actions/AddUsersQuickAction";
import CreateInvoiceQuickAction from "./_components/quick-actions/CreateInvoiceQuickAction";
import ManageWebsiteQuickAction from "./_components/quick-actions/ManageWebsiteQuickAction";
import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { hasAnyPermission, hasPermission, Permission } from "../../../../libs/types/permission";
import { useUserData } from "../../../../utils/Hooks";
import StockGraphWidget from "./_components/widgets/StockGraphWidget";
import { Spacer } from "@nextui-org/react";
import InvoiceWidget from "./_components/widgets/invoice/InvoiceWidget";
import CreateInventoryRequestQuickAction from "./_components/quick-actions/CreateInventoryRequestQuickAction";
import InventoryRequestWidget from "./_components/widgets/InventoryRequestWidget";

export default function HomePage() {
    const session = useSession();
    const { data: user, isLoading: userDataIsLoading } = useUserData();

    return (
        <div>
            <Title>Welcome back, <span
                className="text-primary">{session.data?.user?.firstName || "Unknown"}</span></Title>
            <SubTitle>Let&apos;s get to work</SubTitle>
            {
                !userDataIsLoading &&
                (
                    hasAnyPermission(user?.permissions, [
                        Permission.CREATE_INVENTORY,
                        Permission.VIEW_INVENTORY,
                        Permission.MUTATE_STOCK,
                        Permission.VIEW_INVOICES,
                        Permission.CREATE_INVOICE,
                        Permission.ADMINISTRATOR,
                        Permission.MANAGE_STOCK_REQUESTS,
                        Permission.VIEW_STOCK_REQUESTS,
                        Permission.VIEW_STOCK_REQUESTS
                    ]) &&
                    <div className={"w-[90%] mx-auto tablet:w-full mt-12 p-12 phone:p-6 default-container"}>
                        <h4 className="font-light text-xl phone:text-lg tracking-widest uppercase mb-12 phone:mb-6 phone:text-center">Quick
                            Actions</h4>
                        <div
                            className="grid grid-cols-4 tablet:grid-cols-3 phone:grid-cols-1 gap-x-6 gap-y-10 tablet:place-items-center">
                            {
                                hasAnyPermission(user?.permissions, [
                                    Permission.CREATE_INVENTORY,
                                    Permission.VIEW_INVENTORY,
                                    Permission.MUTATE_STOCK
                                ])
                                &&
                                <ManageInventoryQuickAction />
                            }
                            {
                                hasAnyPermission(user?.permissions, [
                                    Permission.CREATE_INVENTORY,
                                    Permission.MANAGE_STOCK_REQUESTS,
                                    Permission.VIEW_STOCK_REQUESTS,
                                    Permission.VIEW_STOCK_REQUESTS
                                ])
                                &&
                                <CreateInventoryRequestQuickAction />
                            }
                            {
                                hasPermission(user?.permissions, Permission.ADMINISTRATOR)
                                &&
                                <AddUsersQuickAction />
                            }
                            {
                                hasAnyPermission(user?.permissions, [
                                    Permission.VIEW_INVOICES,
                                    Permission.CREATE_INVOICE
                                ])
                                &&
                                <CreateInvoiceQuickAction />
                            }
                            {
                                hasPermission(user?.permissions, Permission.ADMINISTRATOR)
                                &&
                                <ManageWebsiteQuickAction />
                            }
                        </div>
                    </div>
                )
            }
            <Spacer y={12} />
            <div className="grid grid-cols-3 place-items-center tablet:grid-cols-1 gap-20">
                {
                    hasAnyPermission(user?.permissions, [
                        Permission.CREATE_INVENTORY,
                        Permission.MANAGE_STOCK_REQUESTS,
                        Permission.VIEW_STOCK_REQUESTS
                    ]) &&
                    <InventoryRequestWidget />
                }
                {
                    hasAnyPermission(user?.permissions, [
                        Permission.CREATE_INVENTORY,
                        Permission.VIEW_INVENTORY,
                        Permission.MUTATE_STOCK
                    ]) &&
                    <StockGraphWidget />
                }
                {
                    hasAnyPermission(user?.permissions, [
                        Permission.VIEW_INVOICES,
                        Permission.CREATE_INVOICE
                    ]) &&
                    <InvoiceWidget />
                }
            </div>
        </div>
    );
}