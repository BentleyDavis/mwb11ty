import { promises } from "fs";

// create a typescript function strongly types to GetFolder
export async function nodeGetFile(filePath: string) {
    return await promises.readFile(filePath, { encoding: "utf-8" });
}

