import * as archiver from 'archiver'
import { FileStorage } from './file-storage'
import { Archiver } from 'archiver'

export interface ArchiverPackage {
    (...args: any[]): Archiver
}

export class ZipCompressor {

    protected static singleton: ZipCompressor

    private compressionDriver: ArchiverPackage
    private fileStorage: FileStorage

    /**
     * Returns a ZipCompressor
     * @constructor
     * @param {ArchiverPackage} compressionDriver - compression driver instance
     * @param {FileStorage} fileStorage - file storage instance
     */
    constructor(compressionDriver: ArchiverPackage, fileStorage: FileStorage) {
        this.compressionDriver = compressionDriver
        this.fileStorage = fileStorage
    }

    /**
     * Compressing source path to destination path
     * @param {string} sourcePath - source path
     * @param {string} outputFile - destination path
     * @returns {Promise<void>} void promise
     */
    public compressDirectory(sourcePath: string, outputFile: string): Promise<void> {
        const archiver = this.compressionDriver('zip', { zlib: { level: 9 } })
        const stream = this.fileStorage.createWriteStream(outputFile)
        return new Promise((resolve, reject) => {
            archiver
                .directory(sourcePath, false)
                .on('error', err => reject(err))
                .pipe(stream)

            stream.on('close', () => resolve())
            archiver.finalize()
        })
    }

    public static get instance(): ZipCompressor {
        if (!this.singleton) {
            const fileStorage = FileStorage.instance;
            this.singleton = new ZipCompressor(archiver, fileStorage)
        }
        return this.singleton
    }

}