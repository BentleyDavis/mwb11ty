import lunr from 'lunr'
import { GetFile } from '../types/GetFile'


export async function createSearchIndex(filePaths: string[], getFile: GetFile) {
    const documents: { link: string, body: string }[] = [];

    for (const filePath of filePaths) {
        documents.push({
            link: filePath,
            body: await getFile(filePath)
        });
    }

    var idx = lunr(function () {
        this.ref('link')
        this.field('body')

        for (const doc of documents) {
            this.add(doc)
        }
    })

    return idx;
}