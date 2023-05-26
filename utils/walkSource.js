"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchIgnores = exports.walkSource = void 0;
const anymatch_1 = __importDefault(require("anymatch"));
async function walkSource(sourcePath, getFolder, notIgnored) {
    const filePaths = [];
    const folderResults = await getFolder(sourcePath);
    // console.log("-" + folderResults.childFolderPaths);
    // console.log("--" + folderResults.childFolderPaths.filter((f) => !ignoresTester(f.replace("..", ""))));
    filePaths.push(...folderResults.filepaths.filter(notIgnored));
    for (const folder of folderResults.childFolderPaths.filter(notIgnored)) {
        filePaths.push(...(await walkSource(folder, getFolder, notIgnored)));
    }
    return filePaths;
}
exports.walkSource = walkSource;
//regex to match any numebr of dots at the start of a string
const dotRegex = /^\.*/;
function MatchIgnores(matchers) {
    const tempIgnoresTester = (0, anymatch_1.default)(matchers);
    return (f) => !tempIgnoresTester(f.replace(dotRegex, ""));
}
exports.MatchIgnores = MatchIgnores;
