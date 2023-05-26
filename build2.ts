// Types
import { Source } from "./types/Source";
import { FileData, LinkData } from "./types/FileData";
import { Index } from "./types/Index";

// Generic functions
import { info, log } from "console";
import { parse as parsePath } from "path-browserify"
import { MatchIgnores, walkSource } from "./utils/walkSource";
import { wikiLinks2HTML } from "./utils/wikiLinks2HTML";

// infrastructure dependent functions
import { nodeSaveFile } from "./utils/nodeSaveFile";
import { nodeDelDir } from "./utils/nodeDelDir";
import { nodeGetFolder } from "./utils/nodeGetFolder";
import { nodeGetFile } from "./utils/nodeGetFile";

// Node specific functions for things that have to be file based
import { promises as fs, writeFile } from "fs";
import { createSearchIndex } from "./utils/createSearchIndex";

// const Eleventy = require("@11ty/eleventy");

// Config
const ignores = [
    "**/node_modules/**",
    "**/.*/**",
    "**/.*",
];

const sources: Source[] = [
    { // get the files from the source repo
        sourcePath: '../massive-wiki/',
        destPath: './input/',
        ignores: ignores,
        type: "fileSystem"
    },
    { // Pull in the base template files
        sourcePath: './templates/base/',
        destPath: './input/',
        ignores: ignores,
        type: "fileSystem"
    },
];

const cacheId = Date.now().valueOf();
const siteData: any = {
    cacheId: cacheId,
    destPath: './input/',
}

const searchIndexFileName = `${siteData.destPath}lunr-index-${cacheId}.js`;
const searchPageIndexFileName = `${siteData.destPath}lunr-pages-${cacheId}.js`;

(async function () {

    info("Starting build...");

    info("listing source files...");

    const files: FileData[] = [];

    for (const [sourceIndex, source] of sources.entries()) {
        const { sourcePath, ignores, destPath } = source;
        const sourceFilePaths = await walkSource(sourcePath, nodeGetFolder, MatchIgnores(ignores));
        for (const sourceFilePath of sourceFilePaths) {
            files.push({
                sourcePath: sourceFilePath,
                destPath: sourceFilePath.replace(sourcePath, destPath),
                sourceId: sourceIndex
            });
        }
    }

    info("Indexing...");

    const fileNameIndex: Index<FileData[]> = files.reduce((index: Index<FileData[]>, item) => {
        const name = parsePath(item.sourcePath).name
        if (index[name]) {
            (index[name]).push(item);
        } else {
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
        if (file.url) file.url = file.url.replaceAll(' ', '_');
    }

    // TODO: Doesn't take into account types of sources other than filesystem
    const getFile = nodeGetFile;

    const markdownLinkRegex = /\[(?<label>[^\]]+)\]\((?<url>[^\)]+)\)/g;
    const htmlLinkRegex = /<a[^>]+href="(?<url>[^"]+)"[^>]*>(?<label>[^<]+)<\/a>/g;

    for (const file of files) {
        const { sourcePath } = file;
        const extension = parsePath(sourcePath).ext;
        if (extension === ".md" || extension === ".html") {
            const content = await getFile(sourcePath);
            const links: LinkData[] = [];

            // get links html links
            for (const match of content.matchAll(htmlLinkRegex)) {
                if (match?.groups) {
                    links.push({
                        ...match.groups,
                        original: match[0],
                        index: match.index
                    } as LinkData);
                }
            }

            for (const match of content.matchAll(markdownLinkRegex)) {
                if (match?.groups) {
                    links.push({
                        ...match.groups,
                        original: match[0],
                        index: match.index
                    } as LinkData);
                }
            }

            // add wikilinks to replacement lists
            if (extension === ".md") {
                const { replacers, newLinks } = wikiLinks2HTML(content, fileNameIndex);
                if (replacers.length) {
                    file.replacers ??= [];
                    file.replacers.push(...replacers);
                }
                if (newLinks.length) {
                    links.push(...newLinks);
                }
            }

            if (links.length) file.links = links;

        }
    }

    info("creating search index...");
    // TODO: change to read from source and uses file data for title and url etc...
    const searchIndex = await createSearchIndex(
        files.map(f => f.sourcePath).filter(f => f.endsWith('md')),
        nodeGetFile);

    info("writing files ---");

    info("clearing destination directories...")
    const delDir = nodeDelDir;

    for (const source of sources) {
        await delDir(source.destPath);
    }

    const saveFile = nodeSaveFile;
    info("Saving data files...");

    // save the fildata to JSON file in the destDir
    for (const file of files) {
        const { name, ext, dir } = parsePath(file.destPath)
        if ([".md", ".html"].includes(ext)) {
            saveFile(
                JSON.stringify(file, null, 2),
                dir + "/" + name + ".json"
            );
        }
    }

    // Output the orginal files to the 11ty input folder
    // Just code in node directly as I don't see any other abstraction necessary for this part in the future. probably need to break this out to a different file
    for (const file of files) {
        await fs.mkdir(parsePath(file.destPath).dir, { recursive: true },);
        await fs.copyFile(file.sourcePath, file.destPath);
    }

    info("Saving search files...");

    // log("searchIndexFileName", searchIndexFileName);
    // log("length", JSON.stringify(searchIndex).length);
    await nodeSaveFile(JSON.stringify(searchIndex), searchIndexFileName);

    // nodeSaveFile(searchPageIndexFileName, JSON.stringify(files));

    // ---------------------------------------------------------------------------------------------
    // let eleventy = new Eleventy();
    // await eleventy.write();
})();