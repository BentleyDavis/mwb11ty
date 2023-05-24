import anymatch, { Matcher, Tester } from "anymatch";
import { MatchIgnores, ResultsOfGetFolder, walkSource } from "./walkSource";

test('the data is peanut butter', async () => {
    const result = await walkSource("../massive-wiki/", mockGetFolder, notIgnored);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("../massive-wiki/not_node/file1");
});

async function mockGetFolder(folderPath: string): Promise<ResultsOfGetFolder> {
    return mockTree[folderPath];
}

const mockTree: { [key: string]: ResultsOfGetFolder } = {
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
    }


}

const ignores: Matcher = [
    "**/node_modules/**"
]

const notIgnored = MatchIgnores(ignores);
