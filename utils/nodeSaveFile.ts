import { promises } from "fs";
import { parse as parsePath } from "path-browserify"

export async function nodeSaveFile(content: string, path: string) {
    await promises.mkdir(parsePath(path).dir, { recursive: true },);
    await promises.writeFile(path, content);
}