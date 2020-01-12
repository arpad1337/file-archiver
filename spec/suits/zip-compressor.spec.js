const { ZipCompressor } = require('../../dist/lib/zip-compressor')
const { FileStorage } = require('../../dist/lib/file-storage')
const { ObjectWritableMock } = require('stream-mock')

const { createSpyFromClass } = require('jasmine-auto-spies')

const objectWritableMockFactory = () => {
    const mock = new ObjectWritableMock()
    setTimeout(() => {
        mock.emit('close')
    }, 1000)
    return mock
}

const compressonDriverStub = {
    subscribers: [],
    sourcePath: '',
    directory: function(sourcePath) {
        this.sourcePath = sourcePath
        return this
    },
    on(event, cb) {
        this.subscribers.push({
            event,
            cb
        })
        return this
    },
    pipe() {
        return this
    },
    finalize() {
        this.subscribers.forEach((subscription) => {
            if (subscription.event === 'close') {
                subscription.cb()
            }
        })
        return this
    }
}

const compressonDriverStubFactory = () => {
    return compressonDriverStub
}

describe('ZipCompressor tests', () => {

    let compressor
    let fileStorage

    beforeEach(() => {
        fileStorage = createSpyFromClass(FileStorage)
        compressor = new ZipCompressor(compressonDriverStubFactory, fileStorage)
    })

    it('should compress', async () => {
        fileStorage.createWriteStream.and.returnValue(objectWritableMockFactory())

        await compressor.compressDirectory('a','b')

        expect(fileStorage.createWriteStream).toHaveBeenCalled()
        expect(fileStorage.createWriteStream).toHaveBeenCalledTimes(1)
        expect(fileStorage.createWriteStream).toHaveBeenCalledWith('b')

        expect(compressonDriverStub.sourcePath).toEqual('a')
    })

})