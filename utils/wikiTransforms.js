
const obsidianImageRegex = /(!?)\[\[([^\]]+)\]\]/g;

function wikiTransforms(content, filesIndex) {
    const matches = content.matchAll(obsidianImageRegex);

    let result = content;

    for (const match of matches) {
        linkContent = match[2].split('|');
        const labl = linkContent[1] || linkContent[0];
        let foundFileData = filesIndex[linkContent[0]]?.[0];
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
            result = result.replace(match[0], `<img src="${url}" alt="${labl}" />`);
        } else {
            // Is a link
            console.log(match[2], url);
            result = result.replace(match[0], `<a href="${url}">${labl}</a>`);
        }
    }

    return result;
};

module.exports = wikiTransforms;
