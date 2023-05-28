import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';
import { FileData } from '../types/FileData';
import { Index } from '../types/Index';

const gitIndex: Index<SimpleGit> = {};

const getGit = (baseDir: string) => {
   let git = gitIndex[baseDir]
   if (!git) {
      git = simpleGit({
         baseDir: baseDir,
         binary: 'git',
         maxConcurrentProcesses: 6,
         trimmed: false,
      });
      gitIndex[baseDir] = git;
   }
   return git;
}

// when setting all options in a single object
export async function gitGetFileMeta(filePath: string, fileData: FileData, baseDir: string) {
   const options = {
      file: `${filePath}`,
      '--max-count': 1
   }

   try {
      const git = getGit(baseDir);
      const gitResult = await git.log(options);
      // console.log(`gitGetFileMeta:`, gitResult, options);
      fileData.lastUpdated = gitResult?.latest?.date;
      fileData.lastUpdatedBy = gitResult?.latest?.author_name
      fileData.lastUpdatedNote = gitResult?.latest?.message
   } catch (error) {
      console.error(`gitGetFileMeta:`, error, options);
   }

   return fileData;
}
