import { FileArchiver, FileFormat } from './lib/file-archiver'

export class Program {

    public static async main(): Promise<void> {
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

        try {
            const archiver = FileArchiver.instance;
            const outputFile = await archiver.archiveFiles(months, sourceFolder, destinationFolder, format)
            console.log('Output:', outputFile)
            this.exit(0)
        } catch(e) {
            console.error(e)
            this.exit(1)
        }
    }

    private static exit(code: number): void {
        process.exit(code);
    }

}