import InvoiceReportsContext from "./components/InvoiceReportsContext";

type Context = {
    params: {
        id: string
    }
}

export default function InvoiceCustomerReportsPage({ params }: Context) {
    return (<InvoiceReportsContext id={params.id} />);
}