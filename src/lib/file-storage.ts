import * as fs from 'fs-extra'
import * as path from 'path'
import * as uuid from 'uuid4'
import { WriteStream } from 'fs'

export interface FileStats {
    isDirectory(): boolean
    mtime: Date
}

export interface FileStoragePackage {
    readdirSync(path: string): string[]
    statSync(path: string): FileStats
    copySync(file: string, destination: string): void
    mkdirSync(path: string): void
    createWriteStream(destination: string): WriteStream
    existsSync(path: string): boolean
    lstatSync(file: string): FileStats
    unlinkSync(file: string): void
    rmdirSync(path: string): void
}

export interface FileWithStats {
    file: string,
    stat: FileStats
}

export class FileStorage {

    protected static singleton: FileStorage

    private fileStorageDriver: FileStoragePackage

    /**
     * Returns a FileStorage
     * @constructor
     * @param {FileStoragePackage} fileStorageDriver - file storage driver instance
     */
    constructor(fileStorageDriver: FileStoragePackage) {
        this.fileStorageDriver = fileStorageDriver
    }

    /**
     * Returns all files in folder
     * @param {string} path - source path
     * @param {boolean} recursive - if resursive
     * @returns {FileWithStats[]} files with stats
     */
    public getFilesFromFolder(path: string, recursive: boolean = false): FileWithStats[] {
        let results = []
        const list = this.fileStorageDriver.readdirSync(path)
        list.forEach((file) => {
            file = path + '/' + file
            const stat = this.fileStorageDriver.statSync(file)
            if (recursive && stat && stat.isDirectory()) {
                results = results.concat(this.getFilesFromFolder(file))
            } else {
                results.push({
                    file,
                    stat
                })
            }
        });
        return results
    }

    /**
     * Deletes files and folder under path
     * @param {string} folder - path of the folder
     */
    public deleteFolderRecursive(folder: string): void {
        if (this.fileStorageDriver.existsSync(folder)) {
            this.fileStorageDriver.readdirSync(folder).forEach((file, index) => {
                const curPath = path.join(folder, file)
                if (this.fileStorageDriver.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                } else {
                    this.fileStorageDriver.unlinkSync(curPath)
                }
            })
            this.fileStorageDriver.rmdirSync(folder)
        }
    }

    /**
     * Deleting file
     * @param {string} file - location of the file
     */
    public deleteFile(file: string): void {
        return this.fileStorageDriver.unlinkSync(file)
    }

    /**
     * Copying files to dest
     * @param {string[]} files - source path of files
     * @returns {string} destination path
     */
    public copyFilesToDestination(files: string[]): string {
        const destination = path.resolve(`/tmp/${uuid()}`)
        this.fileStorageDriver.mkdirSync(destination)
        files.forEach((file: string) => {
            const filename = path.basename(file)
            const fileDestination = path.resolve(`${destination}/${filename}`)
            this.fileStorageDriver.copySync(file, fileDestination)
        })
        return destination
    }

    /**
     * Creating write stream
     * @param {any[]} args - any args
     */
    public createWriteStream(...args: any[]): WriteStream {
        return this.fileStorageDriver.createWriteStream.apply(this.fileStorageDriver, args)
    }

    public static get instance(): FileStorage {
        if (!this.singleton) {
            this.singleton = new FileStorage(fs)
        }
        return this.singleton
    }

}