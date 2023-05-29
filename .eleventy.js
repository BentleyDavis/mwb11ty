const inputDir = './input/';
const outputDir = './output/';

const promises = require('fs').promises;
const jsYaml = require("js-yaml");
// const cacheId = Date.now().valueOf();

// const { copyFile, mkdir } = require('fs').promises;
// const { join } = require('path');


// const search = require("./utils/search.js");
// const lunr = require("lunr");
// const filesIndexer = require("./utils/filesIndexer.js");
// const wikiTransforms = require("./utils/wikiTransforms.js");

// TODO: this is the wrong cacheID, need to reed it from the file
// const searchIndexFileName = `./output/lunr-index-${cacheId}.js`;
// const pageIndexFileName = `./output/lunr-pages-${cacheId}.js`;

module.exports = function (eleventyConfig) {

    eleventyConfig.setUseGitIgnore(false);
    // let filesindex;

    // eleventyConfig.on('eleventy.before', async ({ dir, runMode, outputMode }) => {
    //     filesindex = await filesIndexer(dir.input);

    //     for (const fileDatas of Object.values(filesindex)) {
    //         for (const fileData of fileDatas) {
    //             await mkdir(join(outputDir, fileData.path).replaceAll(' ', '_'), { recursive: true },);
    //             await copyFile(
    //                 join(inputDir, fileData.path, fileData.nameData.base),
    //                 join(outputDir, fileData.path, fileData.nameData.base).replaceAll(' ', '_')
    //             )
    //         }

    //     }
    // });


    // set the default layout 
    //eleventyConfig.addGlobalData("layout", "page.html");
    //eleventyConfig.addGlobalData("permalink", "{{ page.filePathStem | underscore }}.html");
    //eleventyConfig.addGlobalData("title", (a) => { console.log(this); return "-" });


    // // set URLS to be underscores instead of spaces and set readme to index.html
    // eleventyConfig.addFilter("underscore", (content) => {
    //     if (content === '/readme') return '/index'
    //     return content//.replaceAll(' ', '_')
    // });

    // eleventyConfig.addFilter("cacheId", () => cacheId.toString());

    // // wiki Links and images
    // eleventyConfig.addTransform("wikiTransforms", (content) => {
    //     return wikiTransforms(content, filesindex);
    // });

    eleventyConfig.addDataExtension("yml, yaml", (content) => {
        return jsYaml.load(content);
    });

    // // Add Search
    // eleventyConfig.addTransform("search", search.generateSearchFunction(cacheId));
    // eleventyConfig.on('eleventy.after', async ({ dir, results, runMode, outputMode }) => {
    //     search.streamIndex.write("]");
    //     search.streamIndex.end();
    //     search.streamPages.write("]");
    //     search.streamPages.end();

    //     // // read in the search.json file and add it to luna
    //     const fs = require('fs');
    //     if (fs.existsSync(searchIndexFileName)) fs.unlinkSync(searchIndexFileName);
    //     const json = fs.readFileSync('./search.json', 'utf8');
    //     const pages = JSON.parse(json);
    //     // //pages = require(`./search.json`);
    //     var idx = lunr(function () {
    //         this.ref('link')
    //         this.field('title')
    //         this.field('body')
    //         for (const page of pages) {
    //             this.add(page)
    //         }
    //     })
    //     fs.writeFileSync(searchIndexFileName, 'lunr_index = ' + JSON.stringify(idx), 'utf8');
    //     if (fs.existsSync("./searchPages.json")) fs.renameSync(`./searchPages.json`, pageIndexFileName);
    //     //if (fs.existsSync("./search.json")) fs.unlinkSync("./search.json");

    // });

    // do replaces (mostly for wiki links) 
    // TODO: Should this happen after & outside 1ty?
    // but needs to not affect original MD files so this may be the only place
    eleventyConfig.addTransform("mid-processing", async function (content) {
        //console.log(this);
        try {
            const fileDataText = await promises.readFile(
                this.inputPath.replaceAll('.md', '.json'),
                { encoding: "utf-8" });
            if (fileDataText) {
                const fileData = JSON.parse(fileDataText);
                for (const replacer of fileData.replacers) {
                    content = content.replaceAll(replacer.match, replacer.replace);
                }
            }
        } catch (error) {
            //console.error(error);
        }
        return content; // no change done.
    });

    // // copy static files
    // eleventyConfig.addPassthroughCopy({ [`${inputDir}static/`]: `./` });


    // // TODO: doesn't seem to be working to ignore the .obsidion folder
    // for (const ignore of [
    //     '**/.obsidian/**',
    // ]) {
    //     eleventyConfig.ignores.add(ignore);
    //     eleventyConfig.watchIgnores.add(ignore);
    // }
    return {
        templateFormats: ['md'],
        markdownTemplateEngine: "njk",
        dir: {
            input: inputDir,
            output: outputDir,
            data: `_data`,
            layouts: `_layouts`,
            includes: `_includes`,
        }
    }
}

