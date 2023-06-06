type InvoiceObject = {
    id: string,
    title: string,
    addressed_to: string,
    invoice_items: InvoiceItem[]
    date_of_creation: number,
    last_edited: number,
}

type InvoiceItem = {
    item_name: string,
    item_quantity: number,
    item_cost: number
}

export default InvoiceObject;