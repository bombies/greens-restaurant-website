import InvoiceLayout from "./components/InvoiceLayout";

type Context = {
    params: {
        id: string,
        invoiceId: string,
    }
}

export default function InvoicePage({ params }: Context) {
    return (
        <InvoiceLayout customerId={params.id} invoiceId={params.invoiceId} />
    );
}