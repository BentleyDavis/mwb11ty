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
const walkSource_1 = require("./walkSource");
test('two dots', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, walkSource_1.walkSource)("../massive-wiki/", mockGetFolder, notIgnored);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("../massive-wiki/not_node/file1");
}));
test('one dot', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, walkSource_1.walkSource)("./massive-wiki/", mockGetFolder, notIgnored);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("./massive-wiki/not_node/file1");
}));
function mockGetFolder(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return mockTree[folderPath];
    });
}
const mockTree = {
    "../massive-wiki/": {
        childFolderPaths: ["../massive-wiki/node_modules/", "../massive-wiki/not_node/"],
        filepaths: []
    },
    "../massive-wiki/node_modules/": {
        childFolderPaths: [],
        filepaths: ["../massive-wiki/node_modules/file1", "../massive-wiki/node_modules/file2"]
    },
    "../massive-wiki/not_node/": {
        childFolderPaths: [],
        filepaths: ["../massive-wiki/not_node/file1", "../massive-wiki/not_node/file2"]
    },
    "./massive-wiki/": {
        childFolderPaths: ["./massive-wiki/node_modules/", "./massive-wiki/not_node/"],
        filepaths: []
    },
    "./massive-wiki/node_modules/": {
        childFolderPaths: [],
        filepaths: ["./massive-wiki/node_modules/file1", "./massive-wiki/node_modules/file2"]
    },
    "./massive-wiki/not_node/": {
        childFolderPaths: [],
        filepaths: ["./massive-wiki/not_node/file1", "./massive-wiki/not_node/file2"]
    }
};
const ignores = [
    "**/node_modules/**"
];
const notIgnored = (0, walkSource_1.MatchIgnores)(ignores);
