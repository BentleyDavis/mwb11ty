"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitGetFileMeta = void 0;
const simple_git_1 = require("simple-git");
const gitIndex = {};
const getGit = (baseDir) => {
    let git = gitIndex[baseDir];
    if (!git) {
        git = (0, simple_git_1.simpleGit)({
            baseDir: baseDir,
            binary: 'git',
            maxConcurrentProcesses: 6,
            trimmed: false,
        });
        gitIndex[baseDir] = git;
    }
    return git;
};
// when setting all options in a single object
async function gitGetFileMeta(filePath, fileData, baseDir) {
    const options = {
        file: `${filePath}`,
        '--max-count': 1
    };
    try {
        const git = getGit(baseDir);
        const gitResult = await git.log(options);
        // console.log(`gitGetFileMeta:`, gitResult, options);
        fileData.lastUpdated = gitResult?.latest?.date;
        fileData.lastUpdatedBy = gitResult?.latest?.author_name;
        fileData.lastUpdatedNote = gitResult?.latest?.message;
    }
    catch (error) {
        console.error(`gitGetFileMeta:`, error, options);
    }
    return fileData;
}
exports.gitGetFileMeta = gitGetFileMeta;
