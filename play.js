"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = require("simple-git");
// const options: Partial<SimpleGitOptions> = {
//    baseDir: process.cwd(),
//    binary: 'git',
//    maxConcurrentProcesses: 6,
//    trimmed: false,
// };
async function logGitStatus(baseDir) {
    const git = (0, simple_git_1.simpleGit)({
        baseDir: baseDir,
        binary: 'git',
        maxConcurrentProcesses: 6,
        trimmed: false,
    });
    console.log(`---------------------`, baseDir, await git.status());
}
(async function () {
    await logGitStatus('');
    await logGitStatus(`../`);
    await logGitStatus(`../massive-wiki/`);
})();
