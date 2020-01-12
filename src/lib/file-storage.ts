import * as fs from 'fs'

export interface FileStoragePackage {

}

export class FileStorage {

    protected static singleton: FileStorage

    private fileStorageDriver: FileStoragePackage

    constructor(fileStorageDriver: FileStoragePackage) {
        this.fileStorageDriver = fileStorageDriver
    }


    public static get instance(): FileStorage {
        if (!this.singleton) {
            this.singleton = new FileStorage(fs)
        }
        return this.singleton
    }

}