"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeGetFolder = void 0;
const fs_1 = require("fs");
// create a typescript function strongly types to GetFolder
async function nodeGetFolder(folderPath) {
    const childFolderPaths = [];
    const filepaths = [];
    const entries = await fs_1.promises.readdir(folderPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            childFolderPaths.push(folderPath + entry.name + "/");
        }
        else {
            filepaths.push(folderPath + entry.name);
        }
    }
    return { childFolderPaths, filepaths };
}
exports.nodeGetFolder = nodeGetFolder;
