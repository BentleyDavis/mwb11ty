const { parse } = require('path');
const obsidianImageRegex = /(!?)\[\[([^\]]+)\]\]/g;

//TODO: currently ignores relative links and searches for the file in the index
// TODO: currently defaults to the first found file if there are multiple files with the same name

function wikiTransforms(content, filesIndex) {
    const matches = content.matchAll(obsidianImageRegex);

    let result = content;

    for (const match of matches) {
        linkContent = match[2].split('|');
        linkFileData = parse(linkContent[0]);
        const labl = linkContent[1] || linkFileData.name;
        let foundFiles = filesIndex[linkFileData.name];
        if (!foundFiles) {
            foundFiles = [undefined]
        }
        let url = "";
        let stringout = "";
        for (const foundFileData of foundFiles) {

            if (foundFileData) {
                url = "/" +
                    foundFileData.path +
                    (foundFileData.path.length > 0 ? "/" : "") +
                    foundFileData.nameData.name
            } else {
                url = `/${match[2]}`
            }
            url = url.replaceAll(' ', '_')
            url = url.replaceAll('/', '\\')

            if (match[1] === "!") {
                // Is an attachment / image
                stringout += `<img src="${url + foundFileData.nameData.ext}" alt="${labl}" />`;
            } else {
                // Is a link
                stringout += `<a href="${url}">${labl}</a>`;
            }
        }
        result = result.replace(match[0], stringout);

    }

    return result;
};

module.exports = wikiTransforms;
