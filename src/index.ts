import { FileArchiver, FileFormat } from './lib/file-archiver'

export class Program {

    public static main(): void {
        const formats: ReadonlyArray<FileFormat> = ['zip', 'tar.gz']
        const argv = process.argv.slice(2)

        if (argv.length <= 2) {
            console.error('Source or Destination folder not passed')
            this.exit(1)
        }

        const sourceFolder = argv.shift()
        const destinationFolder = argv.pop()
        let format = 'zip'

        if (argv.indexOf('--format') !== -1) {
            format = argv[argv.indexOf('--format') + 1] 
        }

        if (formats.indexOf(format as FileFormat) === -1) {
            console.error('Unsupported output format')
            this.exit(1)
        }

        const archiver = FileArchiver.instance;
        archiver.on('complete', (filename: string) => {
            console.log('Output written into:', filename)
            this.exit(0)
        })
        archiver.archiveFiles(1, sourceFolder, destinationFolder)
    }

    private static exit(code: number): void {
        process.exit(code);
    }

}