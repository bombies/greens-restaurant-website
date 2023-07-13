import InvoiceLayout from "./components/InvoiceLayout";
import { InvoiceProvider } from "./components/InvoiceProvider";
import { InvoiceItemsProvider } from "./components/InvoiceItemsProvider";

type Context = {
    params: {
        id: string,
        invoiceId: string,
    }
}

export default function InvoicePage({ params }: Context) {
    return (
        <InvoiceProvider customerId={params.id} invoiceId={params.invoiceId}>
            <InvoiceItemsProvider>
                <InvoiceLayout customerId={params.id} />
            </InvoiceItemsProvider>
        </InvoiceProvider>
    );
}