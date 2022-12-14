import { NextPage } from "next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useContext, useEffect } from "react";
import { NotificationContext } from "../../components/notifications/NotificationProvider";
import { ModalContext } from "../../components/modals/ModalProvider";
import Layout from "../../components/Layout";
import DashboardSection from "../../components/dashboard/DashboardSection";
import Button from "../../components/button/Button";
import { ButtonType } from "../../types/ButtonType";
import InvoiceObject from "../../types/InvoiceObject";
import { v4 } from "uuid";
import Link from "next/link";
import { userHasPermission } from "../../utils/api/auth";
import { UserPermission } from "../../types/UserPermission";

const generateInvoiceClickable = (info: InvoiceObject) => {
    return (
        <Link href={`/invoices/${info.id}`}>
            <div className="p-4 bg-green-500 rounded-2xl transition-fast cursor-pointer hover:scale-105">
                <h1 className='text-xl font-medium text-white overflow-hidden overflow-ellipsis'>{info.title}</h1>
                <p className='text-lg text-neutral-200 overflow-hidden overflow-ellipsis'>{info.addressed_to}</p>
                <p className={'text-sm text-green-700'}>{`Created: ${new Date(info.date_of_creation).toLocaleDateString('en-UK')}`}</p>
            </div>
        </Link>
    );
}

const Invoices: NextPage = () => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    const dispatchNotification = useContext(NotificationContext);
    const dispatchModal = useContext(ModalContext);

    useEffect(() => {
        if (!userData) {
            router.push("/");
            return;
        }

        if (Object.keys(userData).length == 0) {
            router.push("/");
            return;
        }

        if (!userHasPermission(userData.permissions, UserPermission.MANAGE_INVOICES)) {
            router.push("/");
            return;
        }
    }, [])

    return (
        <Layout
            title="Invoices"
            authenticated={userData && Object.keys(userData).length > 0}
            pageTitle="Invoices"
        >
            <DashboardSection>
                <div className="flex gap-4">
                    <Button
                        type={ButtonType.PRIMARY}
                        label="New Invoice"
                        width={8}
                    />
                    <Button
                        type={ButtonType.DANGER}
                        label='Delete Invoice'
                        width={8}
                    />
                </div>
            </DashboardSection>
            <DashboardSection title='Your Invoices'>
                <div className='grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-4'>
                    {generateInvoiceClickable({
                        id: v4(),
                        title: 'Digicel\'s Invoice',
                        addressed_to: 'Digicel',
                        invoice_items: [
                            {
                                item_name: 'Medium Curry Chicken',
                                item_quantity: 2,
                                item_cost: 600
                            }
                        ],
                        date_of_creation: new Date().getTime(),
                        last_edited: new Date().getTime()
                    })}
                    {generateInvoiceClickable({
                        id: v4(),
                        title: 'RJR\'s Invoice',
                        addressed_to: 'RJR Corporation',
                        invoice_items: [
                            {
                                item_name: 'Medium Curry Chicken',
                                item_quantity: 2,
                                item_cost: 600
                            }
                        ],
                        date_of_creation: new Date().getTime(),
                        last_edited: new Date().getTime()
                    })}
                    {generateInvoiceClickable({
                        id: v4(),
                        title: 'Flow\'s Invoice',
                        addressed_to: 'Flow',
                        invoice_items: [
                            {
                                item_name: 'Medium Curry Chicken',
                                item_quantity: 2,
                                item_cost: 600
                            }
                        ],
                        date_of_creation: new Date().getTime(),
                        last_edited: new Date().getTime()
                    })}
                </div>
            </DashboardSection>
        </Layout>
    );
};

export default Invoices;