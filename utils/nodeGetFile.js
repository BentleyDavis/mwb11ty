"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeGetFile = void 0;
const fs_1 = require("fs");
// create a typescript function strongly types to GetFolder
async function nodeGetFile(filePath) {
    return await fs_1.promises.readFile(filePath, { encoding: "utf-8" });
}
exports.nodeGetFile = nodeGetFile;
