
export interface FileData {
    sourcePath: string;
    destPath: string;
    sourceId: number;
    url?: string;
    replacers?: { match: string, replace: string }[];
    links?: LinkData[];
}

export interface LinkData {
    url: string
    label: string
    original: string
    index?: number
}
