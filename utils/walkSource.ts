import anymatch, { Matcher, Tester } from "anymatch";

export async function walkSource(
    sourcePath: string,
    getFolder: GetFolder,
    notIgnored: NotIgnored
) {
    const filePaths: string[] = [];
    const folderResults = await getFolder(sourcePath)
    // console.log("-" + folderResults.childFolderPaths);
    // console.log("--" + folderResults.childFolderPaths.filter((f) => !ignoresTester(f.replace("..", ""))));

    filePaths.push(...folderResults.filepaths.filter(notIgnored));
    for (const folder of folderResults.childFolderPaths.filter(notIgnored)) {
        filePaths.push(...(await walkSource(folder, getFolder, notIgnored)));
    }
    return filePaths;
}

export type ResultsOfGetFolder = { childFolderPaths: string[], filepaths: string[] }

export type GetFolder = (folderPath: string) => Promise<ResultsOfGetFolder>

export function MatchIgnores(matchers: Matcher) {
    const tempIgnoresTester: Tester = anymatch(matchers);
    return (f: string) => !tempIgnoresTester(f.replace("..", ""))
}

export type NotIgnored = (f: string) => boolean