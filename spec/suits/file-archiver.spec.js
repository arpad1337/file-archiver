const { FileArchiver } = require('../../dist/lib/file-archiver')
const { FileStorage } = require('../../dist/lib/file-storage')
const { ZipCompressor } = require('../../dist/lib/zip-compressor')

const { createSpyFromClass } = require('jasmine-auto-spies')

const files = require('./mock-data')

describe('FileArchiver test', () => {

    let fileStorage
    let zipCompressor
    let fileArchiver

    beforeEach(() => {
        fileStorage = createSpyFromClass(FileStorage)
        zipCompressor = createSpyFromClass(ZipCompressor)

        fileArchiver = new FileArchiver(fileStorage, zipCompressor)
    })

    it('should archive old files', async () => {
        fileStorage.getFilesFromFolder.and.returnValue(files)
        fileStorage.copyFilesToDestination.and.returnValue('/tmp/hash')

        await fileArchiver.archiveFiles(1, '/tmp/src', '/tmp/dest', 'zip')

        expect(fileStorage.getFilesFromFolder).toHaveBeenCalled()
        expect(fileStorage.getFilesFromFolder).toHaveBeenCalledWith('/tmp/src')
        expect(fileStorage.getFilesFromFolder).toHaveBeenCalledTimes(1)

        expect(fileStorage.copyFilesToDestination).toHaveBeenCalled()
        expect(fileStorage.copyFilesToDestination).toHaveBeenCalledWith([files[0].file])
        expect(fileStorage.copyFilesToDestination).toHaveBeenCalledTimes(1)

        expect(zipCompressor.compressDirectory).toHaveBeenCalled()
        expect(zipCompressor.compressDirectory.calls.mostRecent().args[0]).toBe('/tmp/hash')
        expect(zipCompressor.compressDirectory).toHaveBeenCalledTimes(1)

        expect(fileStorage.deleteFolderRecursive).toHaveBeenCalled()
        expect(fileStorage.deleteFolderRecursive).toHaveBeenCalledWith('/tmp/hash')
        expect(fileStorage.deleteFolderRecursive).toHaveBeenCalledTimes(1)

        expect(fileStorage.deleteFile).toHaveBeenCalled()
        expect(fileStorage.deleteFile).toHaveBeenCalledWith(files[0].file)
        expect(fileStorage.deleteFile).toHaveBeenCalledTimes(1)
    })

})