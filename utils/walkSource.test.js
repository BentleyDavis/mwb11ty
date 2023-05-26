"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const walkSource_1 = require("./walkSource");
test('two dots', async () => {
    const result = await (0, walkSource_1.walkSource)("../massive-wiki/", mockGetFolder, notIgnored);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("../massive-wiki/not_node/file1");
});
test('one dot', async () => {
    const result = await (0, walkSource_1.walkSource)("./massive-wiki/", mockGetFolder, notIgnored);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("./massive-wiki/not_node/file1");
});
async function mockGetFolder(folderPath) {
    return mockTree[folderPath];
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
