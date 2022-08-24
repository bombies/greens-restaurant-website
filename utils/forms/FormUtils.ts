export const RequiredField = (val: unknown, errorCb: () => void) => {
    if (val)
        return undefined;
    return errorCb();
};
// @ts-ignore
export const NumberOnlyField = (val: unknown, fieldName: string) => (isNaN(val) ? `${fieldName} must be a number!` : undefined);