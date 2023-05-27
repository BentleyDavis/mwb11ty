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
import { createIndex } from "./utils/createIndex";

const Eleventy = require("@11ty/eleventy");

// Config
const ignores = [
    "**/node_modules/**",
    "**/.*/**",
    "**/.*",
];

// TODO: destPath isn;t really the d\final destination. Change terminology 

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
const siteData = {
    cacheId: cacheId,
    tempPath: './input/',
    outpath: './output/',
}

const searchIndexFileName = `${siteData.tempPath}search-index-${cacheId}.js`;
const searchPageIndexFileName = `${siteData.tempPath}search-pages-${cacheId}.js`;

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
            if (file.url) file.url = file.url.replaceAll(' ', '_').toLowerCase();
        }
    }

    // Convert markdown URLS to end with html and add a title from the file name
    for (const file of files) {
        if (file.url?.endsWith('.md')) {
            file.url = file.url.replace('.md', '.html');
            file.title = parsePath(file.sourcePath).name;
        }
    }

    const fileNameIndex = createIndex(files, (item) => parsePath(item.sourcePath).name);

    const fileUrlIndex = createIndex(files.filter(f => f.url), "url");

    // TODO: Doesn't take into account types of sources other than filesystem
    const getFile = nodeGetFile;

    const markdownLinkRegex = /\[(?<label>[^\]]+)\]\((?<url>[^\)]+)\)/g;
    const htmlLinkRegex = /<a[^>]+href="(?<url>[^"]+)"[^>]*>(?<label>[^<]+)<\/a>/g;

    // Find links in files
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

    const linkIndex: Index<LinkData> = {};

    // find backlinks & make link index
    for (const file of files) {
        const { links } = file;
        if (links) {
            for (const link of links) {
                const { url } = link;
                const linkedFiles = fileUrlIndex[url];
                if (!linkedFiles) continue;
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

    info("creating search index...");
    // TODO: change to read from source and uses file data for title and url etc...
    const searchIndex = await createSearchIndex(
        files.filter(f => f.sourcePath.endsWith('md')),
        nodeGetFile
    );

    // Add the cacheId to the search.json file
    // TODO: is this a hack???
    const searchFile = files.find(f => f.destPath.endsWith('search.md'));
    if (searchFile) {
        searchFile.cacheId = cacheId;
    }




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

        // if the file name matched the sourcePath directory name, make a copy of it names the same as the input directory so 11ty can find it
        const source = sources[file.sourceId];
        const sourceDirName = parsePath(file.sourcePath).dir.split("/").pop();
        if (sourceDirName === parsePath(file.sourcePath).name) {
            const destDirName = parsePath(file.destPath).dir.split("/").pop();
            if (destDirName) {
                await fs.copyFile(file.sourcePath, file.destPath.replace(sourceDirName, destDirName));
            }
        }

        // if (parsePath(file.sourcePath).name === parsePath(source.sourcePath).name) {
        //     await fs.copyFile(file.sourcePath, file.destPath.replace(parsePath(file.destPath).name, parsePath(source.sourcePath).name));
        // }

        await fs.copyFile(file.sourcePath, file.destPath);
    }

    info("Saving search files...");

    await nodeSaveFile(
        "search_index=" + JSON.stringify(searchIndex),
        searchIndexFileName
    );
    await nodeSaveFile(
        "search_pages=" + JSON.stringify(files),
        searchPageIndexFileName
    );

    await nodeSaveFile(JSON.stringify(files), `${siteData.tempPath}files.json`);

    // nodeSaveFile(searchPageIndexFileName, JSON.stringify(files));

    // ---------------------------------------------------------------------------------------------
    // info("Running 11ty...");

    // let eleventy = new Eleventy();
    // await eleventy.write();

    info("Copying all source files to output...");
    // TODO: do i really need ignores here or a different ignores if I don't want some files otput
    // TODO, thid doesn't really fit the design. re-do this
    const filesInTemp = await walkSource(siteData.tempPath, nodeGetFolder, MatchIgnores(ignores));
    for (const file of filesInTemp) {
        const destFile = file.replace(siteData.tempPath, siteData.outpath);
        await fs.mkdir(parsePath(destFile).dir, { recursive: true });
        await fs.copyFile(file, destFile);
    }

})();