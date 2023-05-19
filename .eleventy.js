const wikiTransforms = require('./utils/wikiTransforms.js');
const inputDir = '../massive-wiki/';
module.exports = function (eleventyConfig) {

    // set the default layout 
    eleventyConfig.addGlobalData("layout", "page.html");

    // wiki Links and images
    eleventyConfig.addTransform("wikiTransforms", wikiTransforms);

    // const inspect = require("util").inspect;
    // eleventyConfig.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);

    // //rewrite readme to index.html
    // eleventyConfig.addTransform("readme2Index", async function (content) {
    //     if (this.page.outputPath === 'output/README/index.html') {
    //         this.page.outputPath = 'output/index.html';
    //         this.page.fileSlug = '';
    //         this.page.filePathStem = '/';
    //         console.log(this.page);
    //     }
    //     return content; // no change done.
    // });

    // //rewrite readme to index.html
    // eleventyConfig.addUrlTransform(({ url }) => {
    //     if (url === "/README/") {
    //         console.log(url);
    //         return "/README2/";
    //     }
    // });

    // copy static files
    eleventyConfig.addPassthroughCopy({ "./static/": "/" });


    //copy over all markdown files 
    eleventyConfig.addPassthroughCopy(inputDir + '**/*.md')//, {
    //     expand: true, // expand symbolic links
    //     filter: "!*", // copy all files
    // }
    //     // , {
    //     //     filter: []//, '!**massivewikibuilder**']//, '!**/node_modules/**', '!**/output/**', '!**/static/**', '!**/obsidian/**', '!**/.obsidian/**', '!**/.massivewikibuilder/**', '!**/.massivewikibuilder11ty/**', '!**/.git/**', '!**/.gitignore/**', '!**/.gitattributes/**', '!**/.github/**', '!**/.github/w]
    //     //     //filter: (a, b, c) => { console.log(a, b, c); return true; },
    //     // }
    // );

    for (const ignore of [
        '../.massivewikibuilder/**',
        // '../.massivewikibuilder11ty/output/**',
        // '../.massivewikibuilder11ty/README.md',
        // '../.massivewikibuilder11ty/node_modules/**',
        '../.obsidian/**',
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

