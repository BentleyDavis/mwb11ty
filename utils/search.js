const fs = require('fs');
let first = true

if (fs.existsSync("./search.json")) fs.unlinkSync("./search.json");

var streamIndex = fs.createWriteStream("./search.json", { flags: 'a' });
var streamPages = fs.createWriteStream("./searchPages.json", { flags: 'a' });
streamIndex.write("[");
streamPages.write("lunr_pages = [");
let search;
function generateSearchFunction(cacheId) {
    return function search(content) {
        const originalContent = fs.readFileSync(this.inputPath, 'utf8');

        streamIndex.write((first ? "" : ",") + JSON.stringify({
            link: this.url,
            title: this.url,
            body: originalContent,
        }));

        streamPages.write((first ? "" : ",") + JSON.stringify({
            link: this.url,
            title: this.page.fileSlug,
        }));

        first = false;

        return content;
    }
}

module.exports = { generateSearchFunction, streamIndex, streamPages };
