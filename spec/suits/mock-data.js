let longTimeAgo = new Date('2009-10-19 11:12:13')
let justNow = new Date()

const files = [
    {
        file: 'doesnt-exists.png',
        stat: {
            mtime: longTimeAgo
        }
    },
    {
        file: 'doesnt-exists2.png',
        stat: {
            mtime: justNow
        }
    }
]

module.exports = files