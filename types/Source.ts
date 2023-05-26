import { Matcher } from "anymatch";

export interface Source {
    // Path to the source folder
    sourcePath: string;

    // the relative path from the globalOutputFolder. undefined or empty string means the same as the globalOutputFolder
    destPath: string;

    // TODO: Add support for globs
    // array of items to ignore. regex can be passed as a string if it starts with "regex:""
    ignores: Matcher;

    // Prefix to add to all the urls/ undefined or empty string means the same as the globalUrlPrefix
    urlPrefix?: string;

    // Undelying technology to access the source data/ files
    type: "gitLocal" | "gitRemote" | "fileSystem";
}


