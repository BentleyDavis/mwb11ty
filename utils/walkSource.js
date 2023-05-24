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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchIgnores = exports.walkSource = void 0;
const anymatch_1 = __importDefault(require("anymatch"));
function walkSource(sourcePath, getFolder, notIgnored) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePaths = [];
        const folderResults = yield getFolder(sourcePath);
        // console.log("-" + folderResults.childFolderPaths);
        // console.log("--" + folderResults.childFolderPaths.filter((f) => !ignoresTester(f.replace("..", ""))));
        filePaths.push(...folderResults.filepaths.filter(notIgnored));
        for (const folder of folderResults.childFolderPaths.filter(notIgnored)) {
            filePaths.push(...(yield walkSource(folder, getFolder, notIgnored)));
        }
        return filePaths;
    });
}
exports.walkSource = walkSource;
//regex to match any numebr of dots at the start of a string
const dotRegex = /^\.*/;
function MatchIgnores(matchers) {
    const tempIgnoresTester = (0, anymatch_1.default)(matchers);
    return (f) => !tempIgnoresTester(f.replace(dotRegex, ""));
}
exports.MatchIgnores = MatchIgnores;
