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
Object.defineProperty(exports, "__esModule", { value: true });
const walkSource_1 = require("./utils/walkSource");
const nodeGetFolder_1 = require("./utils/nodeGetFolder");
const Eleventy = require("@11ty/eleventy");
const inputDir = '../massive-wiki/';
const outputDir = './output/';
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting build...");
        const ignores = [
            "**/node_modules/**",
            "**/.*/**",
            "**/.*",
        ];
        const notIgnored = (0, walkSource_1.MatchIgnores)(ignores);
        const sourceFiles = yield (0, walkSource_1.walkSource)(inputDir, nodeGetFolder_1.nodeGetFolder, notIgnored);
        console.log("sourceFiles", sourceFiles);
        // let elev = new Eleventy();
        // await elev.write();
    });
})();
