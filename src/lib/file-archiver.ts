import { FileStorage, FileWithStats } from "./file-storage"
import * as path from 'path'
import { ZipCompressor } from './zip-compressor'
import * as moment from 'moment'

export type FileFormat = 'zip' | 'tar.gz'

export class FileArchiver {

    protected static singleton: FileArchiver

    private fileStorage: FileStorage
    private zipCompressor: ZipCompressor

    /**
     * Returns a FileArchiver
     * @constructor
     * @param {FileStorage} fileStorage - file storage instance
     * @param {ZipCompressor} zipCompressor - zip compressor instance
     */
    constructor(fileStorage: FileStorage, zipCompressor: ZipCompressor) {
        this.fileStorage = fileStorage
        this.zipCompressor = zipCompressor
    }

    /**
     * Archive the files by date before olderThanMonths from sourceFolder to destinationFolder
     * @param {number} olderThanMonths - older than months, previous months as integer
     * @param {string} sourceFolder - source folder
     * @param {string} destinationFolder - destination folder
     * @param {string} format - default: 'zip'
     * @returns {Promise<string>} destination file as promise
     */
    public async archiveFiles(olderThanMonths: number, sourceFolder: string, destinationFolder: string, format: FileFormat = 'zip'): Promise<string> {
        const date = moment().subtract(olderThanMonths, 'months').startOf('month').toDate()
        let files = this.fileStorage.getFilesFromFolder(sourceFolder)
        files = files.filter((file: FileWithStats) => {
            return file.stat.mtime <= date
        })
        const tempFolder = this.fileStorage.copyFilesToDestination(files.map(file => file.file))
        const destinationFile = path.resolve(`${destinationFolder}/${date.toISOString()}.${format}`)
        await this.zipCompressor.compressDirectory(tempFolder, destinationFile)
        this.fileStorage.deleteFolderRecursive(tempFolder)
        files.forEach((file: FileWithStats) => {
            this.fileStorage.deleteFile(file.file)
        })
        return destinationFile
    }

    public static get instance(): FileArchiver {
        if (!this.singleton) {
            const fileStorage = FileStorage.instance
            const zipCompressor = ZipCompressor.instance
            this.singleton = new FileArchiver(fileStorage, zipCompressor)
        }
        return this.singleton
    }

}