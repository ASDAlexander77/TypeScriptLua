import { Run } from './compiler';

declare var process: any;
new Run().run(process.argv[2], 'luabc');
