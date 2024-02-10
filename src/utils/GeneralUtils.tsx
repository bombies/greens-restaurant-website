export function arrayCompare(arr1: any[], arr2: any[]) {
    if (!arr1)
        return false;
    if (!arr2)
        return false;

    if (arr1.length != arr2.length)
        return false;

    let i = 0, l = arr1.length;
    for (; i < l; i++) {
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            if (!arrayCompare(arr1[i], arr2[i]))
                return false;
        } else if (arr1[i] instanceof Object && arr2[i] instanceof Object) {
            if (!compare(arr1[i], arr2[i]))
                return false;
        } else if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

export function compare(object1: any, object2: any) {
    if (!object1)
        return false;
    if (!object2)
        return false;

    for (let propName in object1) {
        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        } else if (typeof object1[propName] != typeof object2[propName]) {
            return false;
        }
    }

    for (let propName in object2) {
        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        } else if (typeof object1[propName] != typeof object2[propName]) {
            return false;
        }

        if (!object1.hasOwnProperty(propName))
            continue;

        if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
            if (!arrayCompare(object1[propName], object2[propName]))
                return false;
        } else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
            if (!compare(object1[propName], object2[propName]))
                return false;
        } else if (object1[propName] != object2[propName]) {
            return false;
        }
    }
    return true;
}

export interface Predicate<T> {
    (item: T): boolean;
}

export function mergeArrays<T>(arr1: T[], arr2: T[], replacerPredicate: Predicate<T>): T[] {
    const mergedArray: T[] = [];

    const mergeObjects = (obj1: T, obj2: T): T => {
        for (const key in obj2)
            if (typeof obj2[key] === "object" && obj2[key] !== null && !Array.isArray(obj2[key]))
                // @ts-ignore
                obj1[key] = mergeObjects(obj1[key], obj2[key]);
            else
                obj1[key] = obj2[key];
        return obj1;
    };

    for (const item of arr1) {
        const index = arr2.findIndex(replacerPredicate);
        if (index !== -1) {
            mergedArray.push(mergeObjects(item, arr2[index]));
            arr2.splice(index, 1);
        } else mergedArray.push(item);
    }

    for (const item of arr2)
        mergedArray.push(item);

    return mergedArray;
}

declare global {
    interface String {
        capitalize(): string;
    }
}

String.prototype.capitalize = function() {
    return this.replace(
        /(\w)(\w*)/g,
        (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
    );
};

export const dollarFormat = new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD"
});

export const dateInputToDateObject = (date?: string): Date | undefined => {
    if (!date)
        return undefined;

    const [year, month, day] = date.split("-");
    const parsedDate: Date | undefined = year ? new Date() : undefined;
    parsedDate?.setFullYear(Number(year), Number(month) - 1, Number(day));
    return parsedDate;
};