
const path = require('path-browserify');

module.exports = {
    title: data => {
        return data.title || path.parse(data.sourcePath).name
    },
    permalink: data => {
        return data.page.filePathStem
            .replace("readme", "index") +
            ".html"
    },
    layout: data => data.layout || "page.html",
};