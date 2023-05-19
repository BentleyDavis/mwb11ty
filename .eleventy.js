const wikiTransforms = require('./utils/wikiTransforms.js');
const inputDir = '../massive-wiki/';

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

    // wiki Links and images
    eleventyConfig.addTransform("wikiTransforms", wikiTransforms);

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

