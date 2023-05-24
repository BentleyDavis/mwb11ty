import { Matcher } from "anymatch";
import { MatchIgnores, NotIgnored, walkSource } from "./utils/walkSource";
import { nodeGetFolder } from "./utils/nodeGetFolder";
const Eleventy = require("@11ty/eleventy");

const inputDir = '../massive-wiki/';
const outputDir = './output/';

(async function () {
    console.log("Starting build...");

    // const ignores: Matcher = [
    //     "**/node_modules/**",
    //     "**/.*/**",
    //     "**/.*",
    // ]

    // const notIgnored: NotIgnored = MatchIgnores(ignores);

    // const sourceFiles = await walkSource(inputDir, nodeGetFolder, notIgnored);
    // console.log("sourceFiles", sourceFiles);

    let eleventy = new Eleventy();
    await eleventy.write();
})();