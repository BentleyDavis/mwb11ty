"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeDelDir = void 0;
const fs_1 = require("fs");
async function nodeDelDir(path) {
    await fs_1.promises.rm(path, { recursive: true, force: true });
}
exports.nodeDelDir = nodeDelDir;
