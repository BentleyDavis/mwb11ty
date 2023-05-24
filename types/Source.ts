import { Matcher } from "anymatch";

export interface Source {
    // Path to the source folder
    Path: string;

    // the relative path from the globalOutputFolder. undefined or empty string means the same as the globalOutputFolder
    outputFolder: string;

    // TODO: Add support for globs
    // array of items to ignore. regex can be passed as a string if it starts with "regex:""
    ignores: Matcher;

    // Undelying technology to access the source data/ files
    type: "gitLocal" | "gitRemote" | "fileSystem";
}


