export enum Permission {
    ADMINISTRATOR = 1 << 8,

    // INVENTORY
    CREATE_INVENTORY = 1 << 1,
    VIEW_INVENTORY = 1 << 2,
    MUTATE_STOCK = 1 << 3,

    // INVOICES
    CREATE_INVOICE = 1 << 4,
    VIEW_INVOICES = 1 << 5,
}

export const hasPermission = (userPermissions: number, permission: Permission) => {
    return ((userPermissions & permission) === permission) || ((userPermissions & Permission.ADMINISTRATOR) === Permission.ADMINISTRATOR);
};

type PermissionObject = {
    label: string,
    value: Permission
}

type PermissionGroup = {
    label: string,
    value: Permission[]
}

export const Permissions: PermissionObject[] = [
    {
        label: 'Administrator',
        value: Permission.ADMINISTRATOR
    },
    {
        label: 'Create Inventories',
        value: Permission.CREATE_INVENTORY
    },
    {
        label: 'View Inventories',
        value: Permission.VIEW_INVENTORY
    },
    {
        label: 'Mutate Stock',
        value: Permission.MUTATE_STOCK
    },
    {
        label: 'Create Invoices',
        value: Permission.CREATE_INVOICE
    },
    {
        label: 'View Invoices',
        value: Permission.VIEW_INVOICES
    }
]

export const PermissionGroups: PermissionGroup[] = [
    {
        label: 'Administrator',
        value: [Permission.ADMINISTRATOR]
    },
    {
        label: 'Manage Inventories',
        value: [Permission.CREATE_INVENTORY, Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK]
    },
    {
        label: 'Manage Invoices',
        value: [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]
    }
]

export default Permission;