import lunr from 'lunr'
import { GetFile } from '../types/GetFile'
import { FileData } from '../types/FileData';


export async function createSearchIndex(files: FileData[], getFile: GetFile) {
    const documents: { link: string, body: string }[] = [];
    let idx = {}
    try {
        for (const file of files) {
            if (file.url) {
                documents.push({
                    link: file.url,
                    body: await getFile(file.sourcePath)
                });
            }
        }

        idx = lunr(function () {
            this.ref('link')
            this.field('body')

            for (const doc of documents) {
                this.add(doc)
            }
        })

    } catch (error) {
        console.error(error);
    }

    return idx;
}