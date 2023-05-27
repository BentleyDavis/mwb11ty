"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wikiLinks2HTML = void 0;
const path_browserify_1 = require("path-browserify");
const obsidianImageRegex = /(!?)\[\[([^\]]+)\]\]/g;
function wikiLinks2HTML(content, filesIndex) {
    const matches = content.matchAll(obsidianImageRegex);
    const replacers = [];
    const newLinks = [];
    let result = content;
    for (const match of matches) {
        const linkContent = match[2].split('|');
        const linkFileData = (0, path_browserify_1.parse)(linkContent[0]);
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
            }
            else {
                url = `/${match[2]}`;
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
            }
            else {
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
exports.wikiLinks2HTML = wikiLinks2HTML;
