
export interface FileData {
    sourcePath: string;
    destPath: string;
    sourceId: number;
    url?: string;
    replacers?: { match: string, replace: string }[];
    links?: LinkData[];
    backLinks?: LinkData[];
    cacheId?: string | number;
    title?: string;
    lastUpdated?: string;
    lastUpdatedBy?: string;
    lastUpdatedNote?: string;
}

export interface LinkData {
    url: string
    label: string
    original: string
    index?: number
}
