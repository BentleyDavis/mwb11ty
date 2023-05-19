const inputDir = '../massive-wiki/';

const search = require("./utils/search.js");
const lunr = require("lunr");
const cacheId = Date.now().valueOf();
const searchIndexFileName = `./output/lunr-index-${cacheId}.js`;
const pageIndexFileName = `./output/lunr-pages-${cacheId}.js`;

module.exports = function (eleventyConfig) {

    // set the default layout 
    eleventyConfig.addGlobalData("layout", "page.html");
    eleventyConfig.addGlobalData("permalink", "{{ page.filePathStem | underscore }}.html");
    eleventyConfig.addGlobalData("title", "{{ page.filePathStem }}.html");


    // set URLS to be underscores instead of spaces and set readme to index.html
    eleventyConfig.addFilter("underscore", (content) => {
        if (content === '/README') return '/index'
        return content.replaceAll(' ', '_')
    });

    eleventyConfig.addFilter("cacheId", () => cacheId.toString());

    // wiki Links and images
    eleventyConfig.addTransform("wikiTransforms", require('./utils/wikiTransforms.js'));

    // Add Search
    eleventyConfig.addTransform("search", search.generateSearchFunction(cacheId));
    eleventyConfig.on('eleventy.after', async ({ dir, results, runMode, outputMode }) => {
        search.streamIndex.write("]");
        search.streamIndex.end();
        search.streamPages.write("]");
        search.streamPages.end();

        // // read in the search.json file and add it to luna
        const fs = require('fs');
        if (fs.existsSync(searchIndexFileName)) fs.unlinkSync(searchIndexFileName);
        const json = fs.readFileSync('./search.json', 'utf8');
        const pages = JSON.parse(json);
        // //pages = require(`./search.json`);
        var idx = lunr(function () {
            this.ref('link')
            this.field('title')
            this.field('body')
            for (const page of pages) {
                this.add(page)
            }
        })
        fs.writeFileSync(searchIndexFileName, 'lunr_index = ' + JSON.stringify(idx), 'utf8');
        fs.renameSync(`./searchPages.json`, pageIndexFileName);
        if (fs.existsSync("./search.json")) fs.unlinkSync("./search.json");

    });

    // copy static files
    eleventyConfig.addPassthroughCopy({ "./static/": "/" });


    //copy over all markdown files 
    eleventyConfig.addPassthroughCopy(inputDir + '**/*.md')//, {

    // TODO: doesn't seem to be working to ignore the .obsidion folder
    for (const ignore of [
        '**/.obsidian/**',
    ]) {
        eleventyConfig.ignores.add(ignore);
        eleventyConfig.watchIgnores.add(ignore);
    }

    return {
        templateFormats: ['md', 'png'],
        dir: {
            input: inputDir,
            output: 'output',
            data: '../mwb11ty/_data',
            layouts: '../mwb11ty/_layouts',
            includes: '../mwb11ty/_includes',
        }
    }
}

