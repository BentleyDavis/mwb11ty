import { promises } from "fs";

export async function nodeDelDir(path: string) {
    await promises.rm(path, { recursive: true, force: true });
}

