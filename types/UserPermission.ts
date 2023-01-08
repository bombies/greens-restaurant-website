export enum UserPermission {
    ADMINISTRATOR = 1 << 8,
    MANAGE_INVENTORY = 1 << 1,
    MANAGE_EMPLOYEES = 1 << 2,
    MANAGE_SALARIES = 1 << 3,
    MANAGE_INVOICES = 1 << 4
}