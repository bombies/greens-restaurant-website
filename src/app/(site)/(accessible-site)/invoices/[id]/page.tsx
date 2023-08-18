import InvoiceCustomerLayout from "./components/InvoiceCustomerLayout";

type Context = {
    params: {
        id: string
    }
}

export default function InvoiceCustomerPage({ params }: Context) {
    return <InvoiceCustomerLayout id={params.id} />;
}