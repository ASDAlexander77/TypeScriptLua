import { Run } from './compiler';

declare var process: any;
new Run().run(Run.processFiles(process.argv), 'lua', Run.processOptions(process.argv));
