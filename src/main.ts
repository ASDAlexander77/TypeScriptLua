import { Run } from './compiler';

declare var process: any;

try {
    new Run().run(Run.processFiles(process.argv), 'lua', Run.processOptions(process.argv));
} catch (e) {
    print();
}

function print() {
    console.log(`Version 0.0.1
    Syntax:   tsc-lua [options] [file...]

    Examples: tsc-lua hello.ts
              tsc-lua --jslib file.ts
              tsc-lua tsconfig.json
              tsc-lua

    Options:
     -jslib                                             Use JS library.
     -singleModule                                      Output single file.
     -varAsLet                                          Use all 'var' variables as 'let'.
     `);
}
