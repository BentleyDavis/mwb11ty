import { promises } from "fs";
import { ResultsOfGetFolder } from "./walkSource";

// create a typescript function strongly types to GetFolder
export async function nodeGetFolder(folderPath: string): Promise<ResultsOfGetFolder> {
    const childFolderPaths: string[] = [];
    const filepaths: string[] = [];

    const entries = await promises.readdir(folderPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            childFolderPaths.push(folderPath + entry.name + "/");
        } else {
            filepaths.push(folderPath + entry.name);
        }
    }

    return { childFolderPaths, filepaths };
}

