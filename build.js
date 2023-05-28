"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generic functions
const console_1 = require("console");
const path_browserify_1 = require("path-browserify");
const walkSource_1 = require("./utils/walkSource");
const wikiLinks2HTML_1 = require("./utils/wikiLinks2HTML");
// infrastructure dependent functions
const nodeSaveFile_1 = require("./utils/nodeSaveFile");
const nodeDelDir_1 = require("./utils/nodeDelDir");
const nodeGetFolder_1 = require("./utils/nodeGetFolder");
const nodeGetFile_1 = require("./utils/nodeGetFile");
// Node specific functions for things that have to be file based
const fs_1 = require("fs");
const createSearchIndex_1 = require("./utils/createSearchIndex");
const createIndex_1 = require("./utils/createIndex");
const gitGetFileMeta_1 = require("./utils/gitGetFileMeta");
const Eleventy = require("@11ty/eleventy");
// Config
const ignores = [
    "**/node_modules/**",
    "**/.*/**",
    "**/.*",
];
// TODO: destPath isn;t really the d\final destination. Change terminology 
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
const cacheId = Date.now().valueOf();
const siteData = {
    cacheId: cacheId,
    tempPath: './input/',
    outpath: './output/',
};
const searchIndexFileName = `${siteData.tempPath}search-index-${cacheId}.js`;
const searchPageIndexFileName = `${siteData.tempPath}search-pages-${cacheId}.js`;
(async function () {
    (0, console_1.info)("Starting build...");
    (0, console_1.info)("listing source files...");
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
    (0, console_1.info)("Indexing...");
    // const fileNameIndex: Index<FileData[]> = files.reduce((index: Index<FileData[]>, item) => {
    //     const name = parsePath(item.sourcePath).name
    //     if (index[name]) {
    //         (index[name]).push(item);
    //     } else {
    //         index[name] = [item];
    //     }
    //     return index;
    // }, {});
    // Convert Destination paths to urls
    for (const file of files) {
        const { destPath, sourceId } = file;
        const { destPath: sourceDestPath, urlPrefix } = sources[sourceId];
        const url = destPath.replace(sourceDestPath, urlPrefix || "");
        file.url = url;
    }
    // Convert markdown URLS to use underscores instead of spaces and
    for (const file of files) {
        if (file.destPath.endsWith('.md')) {
            file.destPath = file.destPath.replaceAll(' ', '_').toLowerCase();
            if (file.url)
                file.url = file.url.replaceAll(' ', '_').toLowerCase();
        }
    }
    // Convert markdown URLS to end with html and add a title from the file name
    for (const file of files) {
        if (file.url?.endsWith('.md')) {
            file.url = file.url.replace('.md', '.html');
            file.title = (0, path_browserify_1.parse)(file.sourcePath).name;
        }
    }
    const fileNameIndex = (0, createIndex_1.createIndex)(files, (item) => (0, path_browserify_1.parse)(item.sourcePath).name);
    const fileUrlIndex = (0, createIndex_1.createIndex)(files.filter(f => f.url), "url");
    // TODO: Doesn't take into account types of sources other than filesystem
    const getFile = nodeGetFile_1.nodeGetFile;
    // Get File Metadata - last modified date, last modified by, etc
    for (const file of files) {
        const source = sources[file.sourceId];
        const fileMeta = await (0, gitGetFileMeta_1.gitGetFileMeta)(file.sourcePath.slice(source.sourcePath.length), file, source.sourcePath);
    }
    const markdownLinkRegex = /\[(?<label>[^\]]+)\]\((?<url>[^\)]+)\)/g;
    const htmlLinkRegex = /<a[^>]+href="(?<url>[^"]+)"[^>]*>(?<label>[^<]+)<\/a>/g;
    // Find links in files
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
    const linkIndex = {};
    // find backlinks & make link index
    for (const file of files) {
        const { links } = file;
        if (links) {
            for (const link of links) {
                const { url } = link;
                const linkedFiles = fileUrlIndex[url];
                if (!linkedFiles)
                    continue;
                for (const linkedFile of linkedFiles) {
                    linkedFile.backLinks ??= [];
                    linkedFile.backLinks.push({
                        url: file.url || "",
                        label: file.title || file.url || "",
                        original: link.original,
                        index: link.index
                    });
                }
            }
        }
    }
    // Create the search index
    (0, console_1.info)("creating search index...");
    // TODO: change to read from source and uses file data for title and url etc...
    const searchIndex = await (0, createSearchIndex_1.createSearchIndex)(files.filter(f => f.sourcePath.endsWith('md')), nodeGetFile_1.nodeGetFile);
    // Add the cacheId to the search.json file
    // TODO: is this a hack???
    const searchFile = files.find(f => f.destPath.endsWith('search.md'));
    if (searchFile) {
        searchFile.cacheId = cacheId;
    }
    (0, console_1.info)("writing files ---");
    (0, console_1.info)("clearing destination directories...");
    const delDir = nodeDelDir_1.nodeDelDir;
    for (const source of sources) {
        await delDir(source.destPath);
    }
    const saveFile = nodeSaveFile_1.nodeSaveFile;
    (0, console_1.info)("Saving data files...");
    // save the fildata to JSON file in the destDir
    for (const file of files) {
        const { name, ext, dir } = (0, path_browserify_1.parse)(file.destPath);
        if ([".md", ".html"].includes(ext)) {
            saveFile(JSON.stringify(file, null, 2), dir + "/" + name + ".json");
        }
    }
    // Output the orginal files to the 11ty input folder
    // Just code in node directly as I don't see any other abstraction necessary for this part in the future. probably need to break this out to a different file
    for (const file of files) {
        await fs_1.promises.mkdir((0, path_browserify_1.parse)(file.destPath).dir, { recursive: true });
        // if the file name matched the sourcePath directory name, make a copy of it names the same as the input directory so 11ty can find it
        const source = sources[file.sourceId];
        const sourceDirName = (0, path_browserify_1.parse)(file.sourcePath).dir.split("/").pop();
        if (sourceDirName === (0, path_browserify_1.parse)(file.sourcePath).name) {
            const destDirName = (0, path_browserify_1.parse)(file.destPath).dir.split("/").pop();
            if (destDirName) {
                await fs_1.promises.copyFile(file.sourcePath, file.destPath.replace(sourceDirName, destDirName));
            }
        }
        // if (parsePath(file.sourcePath).name === parsePath(source.sourcePath).name) {
        //     await fs.copyFile(file.sourcePath, file.destPath.replace(parsePath(file.destPath).name, parsePath(source.sourcePath).name));
        // }
        await fs_1.promises.copyFile(file.sourcePath, file.destPath);
    }
    (0, console_1.info)("Saving search files...");
    await (0, nodeSaveFile_1.nodeSaveFile)("search_index=" + JSON.stringify(searchIndex), searchIndexFileName);
    await (0, nodeSaveFile_1.nodeSaveFile)("search_pages=" + JSON.stringify(files), searchPageIndexFileName);
    await (0, nodeSaveFile_1.nodeSaveFile)(JSON.stringify(files), `${siteData.tempPath}files.json`);
    // nodeSaveFile(searchPageIndexFileName, JSON.stringify(files));
    // ---------------------------------------------------------------------------------------------
    // info("Running 11ty...");
    // let eleventy = new Eleventy();
    // await eleventy.write();
    (0, console_1.info)("Copying all source files to output...");
    // TODO: do i really need ignores here or a different ignores if I don't want some files otput
    // TODO, thid doesn't really fit the design. re-do this
    const filesInTemp = await (0, walkSource_1.walkSource)(siteData.tempPath, nodeGetFolder_1.nodeGetFolder, (0, walkSource_1.MatchIgnores)(ignores));
    for (const file of filesInTemp) {
        const destFile = file.replace(siteData.tempPath, siteData.outpath);
        await fs_1.promises.mkdir((0, path_browserify_1.parse)(destFile).dir, { recursive: true });
        await fs_1.promises.copyFile(file, destFile);
    }
})();
