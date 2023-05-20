const inputDir = '../massive-wiki/';
const outputDir = './output/';

const { copyFile, mkdir } = require('fs').promises;
const { join } = require('path');


const search = require("./utils/search.js");
const lunr = require("lunr");
const filesIndexer = require("./utils/filesIndexer.js");
const jsYaml = require("js-yaml");
const wikiTransforms = require("./utils/wikiTransforms.js");
const { log } = require('console');

const cacheId = Date.now().valueOf();
const searchIndexFileName = `./output/lunr-index-${cacheId}.js`;
const pageIndexFileName = `./output/lunr-pages-${cacheId}.js`;

module.exports = function (eleventyConfig) {

    let filesindex;

    eleventyConfig.on('eleventy.before', async ({ dir, runMode, outputMode }) => {
        filesindex = await filesIndexer(dir.input);

        for (const fileDatas of Object.values(filesindex)) {
            for (const fileData of fileDatas) {
                console.log(fileData)
                console.log(join(inputDir, fileData.path, fileData.nameData.base));
                console.log(join(outputDir, fileData.path, fileData.nameData.base).replaceAll(' ', '_'));
                await mkdir(join(outputDir, fileData.path).replaceAll(' ', '_'), { recursive: true },);
                await copyFile(
                    join(inputDir, fileData.path, fileData.nameData.base),
                    join(outputDir, fileData.path, fileData.nameData.base).replaceAll(' ', '_')
                )
            }

        }
    });


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
    eleventyConfig.addTransform("wikiTransforms", (content) => {
        return wikiTransforms(content, filesindex);
    });

    eleventyConfig.addDataExtension("yml, yaml", (content) => {
        return jsYaml.load(content);
    });

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
        if (fs.existsSync("./searchPages.json")) fs.renameSync(`./searchPages.json`, pageIndexFileName);
        //if (fs.existsSync("./search.json")) fs.unlinkSync("./search.json");

    });

    // copy static files
    eleventyConfig.addPassthroughCopy({ "./static/": "/" });


    // TODO: doesn't seem to be working to ignore the .obsidion folder
    for (const ignore of [
        '**/.obsidian/**',
    ]) {
        eleventyConfig.ignores.add(ignore);
        eleventyConfig.watchIgnores.add(ignore);
    }

    return {
        templateFormats: ['md'],
        dir: {
            input: inputDir,
            output: 'output',
            data: '../mwb11ty/_data',
            layouts: '../mwb11ty/_layouts',
            includes: '../mwb11ty/_includes',
        }
    }
}

