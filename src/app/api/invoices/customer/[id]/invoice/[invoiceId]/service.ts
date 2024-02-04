import specificCustomerService from "../../service";
import {
    InvoiceCustomerWithOptionalInvoices
} from "../../../../../../(site)/(accessible-site)/home/_components/widgets/invoice/InvoiceWidget";
import { buildResponse } from "../../../../../utils/utils";

class SpecificInvoiceService {
    constructor() {
    }

    fetchInvoice = async (customerId: string, invoiceId: string, withItems?: boolean) => {
        if (!/^[a-f\d]{24}$/i.test(customerId))
            return buildResponse({
                message: "The customer ID is an invalid ID!",
                status: 404
            });
        if (!/^[a-f\d]{24}$/i.test(invoiceId))
            return buildResponse({
                message: "The invoice ID is an invalid ID!",
                status: 404
            });

        const customerInfoResponse = await specificCustomerService(customerId).fetchCustomerInfo(true, withItems);
        if (customerInfoResponse.status !== 200)
            return customerInfoResponse;
        const customerInfo = (await customerInfoResponse.json()) as InvoiceCustomerWithOptionalInvoices

        const invoices = customerInfo.invoices!;
        const thisInvoice = invoices.find(invoice => invoice.id === invoiceId);
        if (!thisInvoice)
            return buildResponse({
                message: `There is no invoice for ${customerInfo.customerName} with the id: ${invoiceId}`,
                status: 404
            });
        return buildResponse({data: thisInvoice});
    };
}

const specificInvoiceService = new SpecificInvoiceService()
export default specificInvoiceService