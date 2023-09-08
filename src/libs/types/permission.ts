export enum Permission {
    /**
     * Permission to do everything
     */
    ADMINISTRATOR = 1 << 8,

    // INVENTORY
    /**
     * This grants the user to create inventories.
     * It also automatically allows viewing inventories and mutating
     * stock as well as stock requests.
     * This permission also  grants the ability to view and mutate the
     * bar inventory.
     */
    CREATE_INVENTORY = 1 << 1,

    /**
     * This grants read-only permission to a user for inventories.
     */
    VIEW_INVENTORY = 1 << 2,

    /**
     * This grants read and write permissions to a user for inventories.
     * This does not allow a user to create an inventory.
     */
    MUTATE_STOCK = 1 << 3,

    /**
     * This grants the user the permission to create a stock request.
     * This will also allow the user to see their own stock requests.
     */
    CREATE_STOCK_REQUEST = 1 << 6,

    /**
     * This grants the user to view all open stock requests.
     * This is read-only access, meaning the user will not be
     * able to accept or reject stock requests. This permission
     * will automatically grant the permission to create a stock
     * request.
     */
    VIEW_STOCK_REQUESTS = 1 << 7,

    /**
     * This allows the user to accept or reject stock requests
     * made by other users. It will also allow the user stock
     * requests to be assigned to them.
     */
    MANAGE_STOCK_REQUESTS = 1 << 9,

    /**
     * This allows the user to view all bar inventories.
     * They will also be allowed to view all snapshots and
     * insights.
     */
    VIEW_BAR_INVENTORY = 1 << 10,

    /**
     * This allows the user to mutate bar inventories.
     * Meaning they will be allowed to update the inventory information
     * and update stock information.
     */
    MUTATE_BAR_INVENTORY = 1 << 11,

    // INVOICES
    /**
     * This allows the user to create invoice customers and
     * create invoices. The permission to view customers and
     * invoices is inherited.
     */
    CREATE_INVOICE = 1 << 4,

    /**
     * This allows the user to view all invoices for all customers
     * as well as reports for the company and customer.
     */
    VIEW_INVOICES = 1 << 5,
}

export const hasAnyPermission = (userPermissions: number = 0, permissions: Permission[]) => {
    return permissions
        .map(permission => hasPermission(userPermissions, permission))
        .includes(true);
};

export const hasPermissions = (userPermissions: number = 0, permissions: Permission[]) => {
    return !permissions
        .map(permission => hasPermission(userPermissions, permission))
        .includes(false);
};

export const hasPermission = (userPermissions: number = 0, permission: Permission) => {
    return (permissionCheck(userPermissions, permission)) || ((userPermissions & Permission.ADMINISTRATOR) === Permission.ADMINISTRATOR);
};

export const permissionCheck = (userPermissions: number = 0, permission: Permission) => {
    return (userPermissions & permission) === permission;
};

type PermissionObject = {
    label: string,
    description?: string,
    value: Permission,
}

type PermissionGroup = {
    label: string,
    value: Permission[]
}

export const Permissions: PermissionObject[] = [
    {
        label: "Administrator",
        value: Permission.ADMINISTRATOR
    },
    {
        label: "Create Inventory",
        value: Permission.CREATE_INVENTORY
    },
    {
        label: "View Inventory",
        value: Permission.VIEW_INVENTORY
    },
    {
        label: "Mutate Stock",
        value: Permission.MUTATE_STOCK
    },
    {
        label: "View Bar Inventory",
        value: Permission.VIEW_BAR_INVENTORY
    },
    {
        label: "Mutate Bar Stock",
        value: Permission.MUTATE_BAR_INVENTORY
    },
    {
        label: "Create Stock Request",
        value: Permission.CREATE_STOCK_REQUEST
    },
    {
        label: "View Stock Requests",
        value: Permission.VIEW_STOCK_REQUESTS
    },
    {
        label: "Manage Stock Requests",
        value: Permission.MANAGE_STOCK_REQUESTS
    },
    {
        label: "Create Invoice",
        value: Permission.CREATE_INVOICE
    },
    {
        label: "View Invoices",
        value: Permission.VIEW_INVOICES
    }
];

export const permissionGroups = {
    administrator: {
        label: "Administrator",
        value: [Permission.ADMINISTRATOR]
    },
    manageInventory: {
        label: "Manage Inventory",
        value: [
            Permission.CREATE_INVENTORY,
            Permission.VIEW_INVENTORY,
            Permission.MUTATE_STOCK,
            Permission.CREATE_STOCK_REQUEST,
            Permission.VIEW_STOCK_REQUESTS,
            Permission.MANAGE_STOCK_REQUESTS
        ]
    },
    manageInvoices: {
        label: "Manage Invoices",
        value: [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]
    }
};

export default Permission;