const { join, normalize, parse } = require('path');
const { readdir } = require('fs').promises;

async function filesIndexer(dir, fileIndex = {}) {
    for await (const f of getFiles(normalize(dir))) {
        const parsedName = parse(f.name)
        const formattedFileData = { nameData: parsedName, path: f.path.slice(dir.length) }
        if (!fileIndex[parsedName.name]) {
            fileIndex[parsedName.name] = [formattedFileData];
        } else {
            fileIndex[parsedName.name] = push(formattedFileData)
        }
    }
    return fileIndex;
}




// TODO get dirctories to skip from elevent and use globs
async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = join(dir, dirent.name);
        if (dirent.isDirectory()) {
            if (!(
                dirent.name.startsWith(".") ||
                dirent.name === "node_modules"
            )) {
                yield* getFiles(res);
            }
        } else {
            yield dirent;
        }
    }
}

module.exports = filesIndexer;
