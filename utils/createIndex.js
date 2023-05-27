"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIndex = void 0;
function createIndex(items, key) {
    return items.reduce((index, item) => {
        let name = "";
        if (typeof key === 'function') {
            name = key(item);
        }
        if (typeof key === 'string') {
            name = item[key];
        }
        const itemArray = index[name];
        if (itemArray) {
            (itemArray).push(item);
        }
        else {
            index[name] = [item];
        }
        return index;
    }, {});
}
exports.createIndex = createIndex;
