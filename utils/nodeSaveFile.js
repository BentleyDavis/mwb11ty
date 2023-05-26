"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeSaveFile = void 0;
const fs_1 = require("fs");
const path_browserify_1 = require("path-browserify");
async function nodeSaveFile(content, path) {
    await fs_1.promises.mkdir((0, path_browserify_1.parse)(path).dir, { recursive: true });
    await fs_1.promises.writeFile(path, content);
}
exports.nodeSaveFile = nodeSaveFile;
