import { Column } from "../../(site)/(accessible-site)/invoices/[id]/[invoiceId]/components/table/InvoiceTable";
import { useCallback, useState } from "react";

const useToggleableColumns = (initialColumns: Column[], initialHiddenColumns: string[] = []) => {
    const [columns, setColumns] = useState<Column[]>(
        initialColumns.filter((column) => !initialHiddenColumns.includes(column.key))
    );

    const findColumnIndexByKey = useCallback((key: string) => {
        return columns.findIndex((column) => column.key.toLowerCase() === key.toLowerCase());
    }, [columns]);

    const findOriginalColumnIndexByKey = useCallback((key: string) => {
        return initialColumns.findIndex((column) => column.key.toLowerCase() === key.toLowerCase());
    }, [initialColumns]);

    const toggleColumn = (key: string) => {
        setColumns((prev) => {
            const columnIndex = findColumnIndexByKey(key);
            if (columnIndex === -1) {
                const originalColumnIndex = findOriginalColumnIndexByKey(key);
                if (originalColumnIndex === -1)
                    return prev;
                return prev.toSpliced(originalColumnIndex, 0, initialColumns[originalColumnIndex]);
            }

            return prev.toSpliced(columnIndex, 1);
        });
    };

    const setColumnVisible = useCallback((key: string, visible: boolean) => {
        setColumns((prev) => {
            if (visible) {
                const originalColumnIndex = findOriginalColumnIndexByKey(key);
                if (originalColumnIndex === -1)
                    return prev;
                return prev.toSpliced(originalColumnIndex, 0, initialColumns[originalColumnIndex]);
            } else {
                const columnIndex = findColumnIndexByKey(key);
                if (columnIndex === -1)
                    return prev;
                return prev.toSpliced(columnIndex, 1);
            }
        });
    }, [findColumnIndexByKey, findOriginalColumnIndexByKey, initialColumns]);

    return {
        columns,
        toggleColumn,
        setColumnVisible
    };
};

export default useToggleableColumns;