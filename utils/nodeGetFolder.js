"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeGetFolder = void 0;
const fs_1 = require("fs");
// create a typescript function strongly types to GetFolder
function nodeGetFolder(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const childFolderPaths = [];
        const filepaths = [];
        const entries = yield fs_1.promises.readdir(folderPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                childFolderPaths.push(folderPath + entry.name + "/");
            }
            else {
                filepaths.push(folderPath + entry.name);
            }
        }
        return { childFolderPaths, filepaths };
    });
}
exports.nodeGetFolder = nodeGetFolder;
