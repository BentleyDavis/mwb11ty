
const obsidianImageRegex = /(!?)\[\[([^\]]+)\]\]/g;


function wikiTransforms(content) {
    const matches = content.matchAll(obsidianImageRegex);

    let result = content;

    for (const match of matches) {
        if (match[1] === "!") {
            // Is an attachment / image
            result = result.replace(match[0], `<img src="/${match[2].replaceAll(' ', '_')}" alt="${match[2]}" />`);
        } else {
            // Is a link
            result = result.replace(match[0], `<a href="/${match[2].replaceAll(' ', '_')}">${match[2]}</a>`);
        }
    }

    return result;
};

module.exports = wikiTransforms;
