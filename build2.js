"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const walkSource_1 = require("./utils/walkSource");
const nodeGetFolder_1 = require("./utils/nodeGetFolder");
const nodeGetFile_1 = require("./utils/nodeGetFile");
const console_1 = require("console");
const path_browserify_1 = require("path-browserify");
const wikiLinks2HTML_1 = require("./utils/wikiLinks2HTML");
const nodeSaveFile_1 = require("./utils/nodeSaveFile");
const nodeDelDir_1 = require("./utils/nodeDelDir");
// import { createSearchIndex } from "./utils/createSearchIndex";
// const Eleventy = require("@11ty/eleventy");
const ignores = [
    "**/node_modules/**",
    "**/.*/**",
    "**/.*",
];
const sources = [
    {
        sourcePath: '../massive-wiki/',
        destPath: './input/',
        ignores: ignores,
        type: "fileSystem"
    },
    {
        sourcePath: './templates/base/',
        destPath: './input/',
        ignores: ignores,
        type: "fileSystem"
    },
];
(async function () {
    (0, console_1.log)("Starting build...");
    (0, console_1.log)("listing source files...");
    const files = [];
    for (const [sourceIndex, source] of sources.entries()) {
        const { sourcePath, ignores, destPath } = source;
        const sourceFilePaths = await (0, walkSource_1.walkSource)(sourcePath, nodeGetFolder_1.nodeGetFolder, (0, walkSource_1.MatchIgnores)(ignores));
        for (const sourceFilePath of sourceFilePaths) {
            files.push({
                sourcePath: sourceFilePath,
                destPath: sourceFilePath.replace(sourcePath, destPath),
                sourceId: sourceIndex
            });
        }
    }
    (0, console_1.log)("Indexing...");
    const fileNameIndex = files.reduce((index, item) => {
        const name = (0, path_browserify_1.parse)(item.sourcePath).name;
        if (index[name]) {
            (index[name]).push(item);
        }
        else {
            index[name] = [item];
        }
        return index;
    }, {});
    // Convert Destination paths to urls
    for (const file of files) {
        const { destPath, sourceId } = file;
        const { destPath: sourceDestPath, urlPrefix } = sources[sourceId];
        const url = destPath.replace(sourceDestPath, urlPrefix || "");
        file.url = url;
    }
    // Convert markdown URLS to use underscores instead of spaces
    for (const file of files) {
        file.destPath = file.destPath.replaceAll(' ', '_');
        if (file.url)
            file.url = file.url.replaceAll(' ', '_');
    }
    //     log("Reading Source Files");
    // TODO: Doesn't take into account types of sources other than filesystem
    const getFile = nodeGetFile_1.nodeGetFile;
    // add capture names to the below regex
    const markdownLinkRegex = /\[(?<label>[^\]]+)\]\((?<url>[^\)]+)\)/g;
    const htmlLinkRegex = /<a[^>]+href="(?<url>[^"]+)"[^>]*>(?<label>[^<]+)<\/a>/g;
    for (const file of files) {
        const { sourcePath } = file;
        const extension = (0, path_browserify_1.parse)(sourcePath).ext;
        if (extension === ".md" || extension === ".html") {
            const content = await getFile(sourcePath);
            const links = [];
            // get links html links
            for (const match of content.matchAll(htmlLinkRegex)) {
                if (match?.groups) {
                    links.push({
                        ...match.groups,
                        original: match[0],
                        index: match.index
                    });
                }
            }
            for (const match of content.matchAll(markdownLinkRegex)) {
                if (match?.groups) {
                    links.push({
                        ...match.groups,
                        original: match[0],
                        index: match.index
                    });
                }
            }
            // add wikilinks to replacement lists
            if (extension === ".md") {
                const { replacers, newLinks } = (0, wikiLinks2HTML_1.wikiLinks2HTML)(content, fileNameIndex);
                if (replacers.length) {
                    file.replacers ??= [];
                    file.replacers.push(...replacers);
                }
                if (newLinks.length) {
                    links.push(...newLinks);
                }
            }
            if (links.length)
                file.links = links;
        }
    }
    (0, console_1.log)("writing files ---");
    (0, console_1.log)("clearing destination directories...");
    const delDir = nodeDelDir_1.nodeDelDir;
    for (const source of sources) {
        await delDir(source.destPath);
    }
    const saveFile = nodeSaveFile_1.nodeSaveFile;
    (0, console_1.log)("Saving data files...");
    // save the fildata to JSON file in the destDir
    for (const file of files) {
        const { name, ext, dir } = (0, path_browserify_1.parse)(file.destPath);
        if ([".md", ".html"].includes(ext)) {
            saveFile(JSON.stringify(file, null, 2), dir + "/" + name + ".json");
        }
    }
    // NEXT STEPS
    // Output the orginal files to the 11ty input folder
    // ---------------------------------------------------------------------------------------------
    // const searchIndex = await createSearchIndex(sourceFiles, nodeGetFile);
    // console.log("searchIndex", searchIndex);
    // let eleventy = new Eleventy();
    // await eleventy.write();
})();
