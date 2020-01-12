import { FileStorage } from "./file-storage"
import { EventEmitter } from 'events'

export type FileFormat = 'zip' | 'tar.gz'

export class FileArchiver extends EventEmitter {

    protected static singleton: FileArchiver

    private fileStorage: FileStorage

    constructor(fileStorage: FileStorage) {
        super()
        this.fileStorage = fileStorage
    }

    archiveFiles(olderThanMonths: number, sourceFolder: string, destinationFolder: string): void {

    }

    public static get instance(): FileArchiver {
        if (!this.singleton) {
            const fileStorage = FileStorage.instance
            this.singleton = new FileArchiver(fileStorage)
        }
        return this.singleton
    }

}