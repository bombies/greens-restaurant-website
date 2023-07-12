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

export const dollarFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});