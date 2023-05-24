import { Source } from "./Source"


export interface mwDeployConfig {

    // list of locations for all the source documents for the main site
    sources: Source[],

    // array or string of globs to ignore
    globalIgnores: string[],

    // the relative path from the location of this file to the global output folder
    globalOutputFolder: string,

}
