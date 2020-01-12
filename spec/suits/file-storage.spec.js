const { FileStorage } = require('../../dist/lib/file-storage')
const { ObjectWritableMock } = require('stream-mock')

const files = require('../helpers/mock-data')

class FSStub {

    readdirSync(path) {
        return files.map((file) => file.file)
    }

    statSync(path) {
        return files.map((file) => file.stat)
    }

    copySync(file, destination) {

    }

    mkdirSync(path) {

    }

    createWriteStream(destination) {
        return new ObjectWritableMock()
    }

    existsSync(path) {
        return true;
    }

    lstatSync(file) {
        return {
            ...files.find((f) => f.file === file),
            isDirectory: () => false
        }
    }

    unlinkSync(file) {

    }

    rmdirSync(path) {

    }
}

describe('FileStorage tests', () => {

    let storage
    let fsStub

    beforeEach(() => {
        fsStub = new FSStub()
        storage = new FileStorage(fsStub)
    })

    it('should return files', () => {
        spyOn(fsStub, 'readdirSync').and.callThrough()
        spyOn(fsStub, 'statSync').and.callThrough()

        const srcFolder = '/tmp/src'

        const folderFiles = storage.getFilesFromFolder(srcFolder)

        expect(folderFiles.map(ff => ff.file)).toEqual(files.map(f => srcFolder + '/' + f.file))
        
        expect(fsStub.readdirSync).toHaveBeenCalled()
        expect(fsStub.readdirSync).toHaveBeenCalledTimes(1)
        expect(fsStub.readdirSync).toHaveBeenCalledWith(srcFolder)

        expect(fsStub.statSync).toHaveBeenCalled()
        expect(fsStub.statSync).toHaveBeenCalledTimes(2)
        expect(fsStub.statSync.calls.argsFor(0)).toEqual([srcFolder + '/' + files[0].file])
        expect(fsStub.statSync.calls.argsFor(1)).toEqual([srcFolder + '/' + files[1].file])
    })

    it('should delete folder recursive', () => {
        spyOn(fsStub, 'existsSync').and.callThrough()
        spyOn(fsStub, 'readdirSync').and.callThrough()
        spyOn(fsStub, 'lstatSync').and.callThrough()
        spyOn(fsStub, 'unlinkSync').and.callThrough()
        spyOn(fsStub, 'rmdirSync').and.callThrough()

        const destFolder = '/tmp/dest'

        storage.deleteFolderRecursive(destFolder)

        expect(fsStub.existsSync).toHaveBeenCalled()
        expect(fsStub.existsSync).toHaveBeenCalledTimes(1)
        expect(fsStub.existsSync).toHaveBeenCalledWith(destFolder)

        expect(fsStub.readdirSync).toHaveBeenCalled()
        expect(fsStub.readdirSync).toHaveBeenCalledTimes(1)
        expect(fsStub.readdirSync).toHaveBeenCalledWith(destFolder)

        expect(fsStub.lstatSync).toHaveBeenCalled()
        expect(fsStub.lstatSync).toHaveBeenCalledTimes(2)
        expect(fsStub.lstatSync.calls.argsFor(0)).toEqual([destFolder + '/' + files[0].file])
        expect(fsStub.lstatSync.calls.argsFor(1)).toEqual([destFolder + '/' + files[1].file])

        expect(fsStub.unlinkSync).toHaveBeenCalled()
        expect(fsStub.unlinkSync).toHaveBeenCalledTimes(2)
        expect(fsStub.unlinkSync.calls.argsFor(0)).toEqual([destFolder + '/' + files[0].file])
        expect(fsStub.unlinkSync.calls.argsFor(1)).toEqual([destFolder + '/' + files[1].file])

        expect(fsStub.rmdirSync).toHaveBeenCalled()
        expect(fsStub.rmdirSync).toHaveBeenCalledTimes(1)
        expect(fsStub.rmdirSync).toHaveBeenCalledWith(destFolder)
    })

    it('should delete file', () => {
        spyOn(fsStub, 'unlinkSync').and.callThrough()

        const destFolder = '/tmp/dest'

        const file = destFolder + '/' + files[0].file

        storage.deleteFile(file)
        expect(fsStub.unlinkSync).toHaveBeenCalled()
        expect(fsStub.unlinkSync).toHaveBeenCalledTimes(1)
        expect(fsStub.unlinkSync).toHaveBeenCalledWith(file)
    })

    it('should copy files to destination', () => {
        spyOn(fsStub, 'mkdirSync').and.callThrough()
        spyOn(fsStub, 'copySync').and.callThrough()

        const srcFolder = '/tmp/src'

        const filesToCopy = files.map((file) => srcFolder + '/' + file.file)

        const destination = storage.copyFilesToDestination(filesToCopy)

        expect(fsStub.mkdirSync).toHaveBeenCalled()
        expect(fsStub.mkdirSync).toHaveBeenCalledTimes(1)

        expect(fsStub.copySync).toHaveBeenCalled()
        expect(fsStub.copySync).toHaveBeenCalledTimes(2)
        expect(fsStub.copySync.calls.argsFor(0)).toEqual([filesToCopy[0], destination + '/' + files[0].file])
        expect(fsStub.copySync.calls.argsFor(1)).toEqual([filesToCopy[1], destination + '/' + files[1].file])
    })

    it('should create write stream', () => {
        spyOn(fsStub, 'createWriteStream').and.callThrough()

        const destFolder = '/tmp/dest'

        const file = destFolder + '/' + files[0].file

        storage.createWriteStream(file)

        expect(fsStub.createWriteStream).toHaveBeenCalled()
        expect(fsStub.createWriteStream).toHaveBeenCalledTimes(1)
        expect(fsStub.createWriteStream).toHaveBeenCalledWith(file)
    })

})