import { log } from 'console';
import { join } from 'path';
import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

// const options: Partial<SimpleGitOptions> = {
//    baseDir: process.cwd(),
//    binary: 'git',
//    maxConcurrentProcesses: 6,
//    trimmed: false,
// };

async function logGitStatus(baseDir: string) {
    const git: SimpleGit = simpleGit({
        baseDir: baseDir,
        binary: 'git',
        maxConcurrentProcesses: 6,
        trimmed: false,
    });

    console.log(`---------------------`,
        baseDir,
        await git.status());
}


(async function () {
    await logGitStatus('');
    await logGitStatus(`../`);
    await logGitStatus(`../massive-wiki/`);
})();
