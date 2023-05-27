import { Index } from "../types/Index";

export function createIndex<t>(items: t[], key: string | ((item: t) => string)) {
    return items.reduce((index: Index<t[] | undefined>, item) => {
        let name = "";
        if (typeof key === 'function') {
            name = key(item);
        }
        if (typeof key === 'string') {
            name = (item as { [key: string]: any })[key];
        }

        const itemArray = index[name];
        if (itemArray) {
            (itemArray).push(item);
        } else {
            index[name] = [item];
        }
        return index;
    }, {});
}
