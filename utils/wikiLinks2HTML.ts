import { Index } from "../types/Index";
import { FileData, LinkData } from "../types/FileData";
import { parse as parsePath } from "path-browserify"

const obsidianImageRegex = /(!?)\[\[([^\]]+)\]\]/g;

export function wikiLinks2HTML(content: string, filesIndex: Index<FileData[]>) {
    const matches = content.matchAll(obsidianImageRegex);
    const replacers = [];
    const newLinks: LinkData[] = [];

    let result = content;

    for (const match of matches) {
        const linkContent = match[2].split('|');
        const linkFileData = parsePath(linkContent[0]);
        const labl = linkContent[1] || linkFileData.name;
        let foundFiles = filesIndex[linkFileData.name];
        if (!foundFiles) {
            foundFiles = [];
        }
        let url = "";
        let stringout = "";
        for (const foundFileData of foundFiles) {
            if (foundFileData?.url) {
                url = foundFileData.url;
            } else {
                url = `/${match[2]}`
            }

            if (match[1] === "!") {
                // Is an attachment / image
                stringout += `<img src="${url}" alt="${labl}" />`;
                newLinks.push({
                    url: url,
                    label: labl,
                    original: match[0],
                    index: match.index
                });
            } else {
                // Is a link
                stringout += `<a href="${url.replace('.md', '').replace('.html', '')}">${labl}</a>`;
                newLinks.push({
                    url: url,
                    label: labl,
                    original: match[0],
                    index: match.index
                });
            }
        }
        if (stringout !== "") {
            replacers.push({ match: match[0], replace: stringout });
        }
    }
    return { replacers, newLinks };
}