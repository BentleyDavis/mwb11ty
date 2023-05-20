const { parse } = require('path');
const obsidianImageRegex = /(!?)\[\[([^\]]+)\]\]/g;

//TODO: currently ignores relative links and searches for the file in the index

function wikiTransforms(content, filesIndex) {
    const matches = content.matchAll(obsidianImageRegex);

    let result = content;

    for (const match of matches) {
        linkContent = match[2].split('|');
        linkFileData = parse(linkContent[0]);
        const labl = linkContent[1] || linkContent[0];
        let foundFileData = filesIndex[linkFileData.name]?.[0];
        let url = "";
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
            result = result.replace(match[0], `<img src="${url + foundFileData.nameData.ext}" alt="${labl}" />`);
        } else {
            // Is a link
            result = result.replace(match[0], `<a href="${url}">${labl}</a>`);
        }
    }

    return result;
};

module.exports = wikiTransforms;
