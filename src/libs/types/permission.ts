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
    value: Permission
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
        label: "Create Inventories",
        value: Permission.CREATE_INVENTORY
    },
    {
        label: "View Inventories",
        value: Permission.VIEW_INVENTORY
    },
    {
        label: "Mutate Stock",
        value: Permission.MUTATE_STOCK
    },
    {
        label: "Create Invoices",
        value: Permission.CREATE_INVOICE
    },
    {
        label: "View Invoices",
        value: Permission.VIEW_INVOICES
    }
];

export const PermissionGroups: PermissionGroup[] = [
    {
        label: "Administrator",
        value: [Permission.ADMINISTRATOR]
    },
    {
        label: "Manage Inventories",
        value: [Permission.CREATE_INVENTORY, Permission.VIEW_INVENTORY, Permission.MUTATE_STOCK]
    },
    {
        label: "Manage Invoices",
        value: [Permission.CREATE_INVOICE, Permission.VIEW_INVOICES]
    }
];

export default Permission;