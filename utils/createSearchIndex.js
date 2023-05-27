"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchIndex = void 0;
const lunr_1 = __importDefault(require("lunr"));
async function createSearchIndex(files, getFile) {
    const documents = [];
    for (const file of files) {
        if (file.url) {
            documents.push({
                link: file.url,
                body: await getFile(file.sourcePath)
            });
        }
    }
    var idx = (0, lunr_1.default)(function () {
        this.ref('link');
        this.field('body');
        for (const doc of documents) {
            this.add(doc);
        }
    });
    return idx;
}
exports.createSearchIndex = createSearchIndex;
