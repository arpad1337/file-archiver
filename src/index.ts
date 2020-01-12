import { FileArchiver, FileFormat } from './lib/file-archiver'

export class Program {

    public static main(): void {
        const formats: ReadonlyArray<FileFormat> = ['zip']
        const argv = process.argv.slice(2)

        if (argv.length < 2) {
            console.error('Source path or Destination folder not passed')
            this.exit(1)
        }

        const sourceFolder = argv.shift()
        const destinationFolder = argv.pop()
        let format = formats[0]
        let months = 0

        if (argv.indexOf('--format') !== -1) {
            format = argv[argv.indexOf('--format') + 1] as FileFormat
        }

        if (argv.indexOf('--months') !== -1) {
            months = parseInt(argv[argv.indexOf('--months') + 1], 10) || 1
        }

        if (formats.indexOf(format as FileFormat) === -1) {
            console.error('Unsupported output format')
            this.exit(1)
        }

        const archiver = FileArchiver.instance;
        archiver.archiveFiles(months, sourceFolder, destinationFolder, format).then((outputFile: string) => {
            console.log('Output:', outputFile)
            this.exit(0)
        })
    }

    private static exit(code: number): void {
        process.exit(code);
    }

}