import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'cross-spawn';
import { Emitter } from './emitter';
import { EmitterLua } from './emitterlua';
import { Helpers } from './helpers';

export enum ForegroundColorEscapeSequences {
    Grey = '\u001b[90m',
    Red = '\u001b[91m',
    Green = '\u001b[92m',
    Yellow = '\u001b[93m',
    Blue = '\u001b[94m',
    Pink = '\u001b[95m',
    Cyan = '\u001b[96m',
    White = '\u001b[97m'
}
export enum BackgroundColorEscapeSequences {
    Grey = '\u001b[100m',
    Red = '\u001b[101m',
    Green = '\u001b[102m',
    Yellow = '\u001b[103m',
    Blue = '\u001b[104m',
    Pink = '\u001b[105m',
    Cyan = '\u001b[106m',
    White = '\u001b[107m'
}
export enum BoldForegroundColorEscapeSequences {
    Grey = '\u001b[90;1m',
    Red = '\u001b[91;1m',
    Green = '\u001b[92;1m',
    Yellow = '\u001b[93;1m',
    Blue = '\u001b[94;1m',
    Pink = '\u001b[95;1m',
    Cyan = '\u001b[96;1m',
    White = '\u001b[97;1m'
}
export enum BoldBackgroundColorEscapeSequences {
    Grey = '\u001b[100;1m',
    Red = '\u001b[101;1m',
    Green = '\u001b[102;1m',
    Yellow = '\u001b[103;1m',
    Blue = '\u001b[104;1m',
    Pink = '\u001b[105;1m',
    Cyan = '\u001b[106;1m',
    White = '\u001b[107;1m'
}
const underlineStyleSequence = '\u001b[4m';
const gutterStyleSequence = '\u001b[7m';
const resetEscapeSequence = '\u001b[0m';

export class Run {

    private formatHost: ts.FormatDiagnosticsHost;
    private versions: Map<string, number> = new Map<string, number>();

    public constructor() {
        this.formatHost = <ts.FormatDiagnosticsHost>{
            getCanonicalFileName: path => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine
        };
    }

    // prefer the interpreter bundled in __dist, fall back to 'lua' on PATH.
    // __dirname is src/ under ts-node but __out/src/ in a build, so walk up to find __dist.
    public static getLuaInterpreter(): string {
        const exe = 'lua' + (process.platform === 'win32' ? '.exe' : '');
        let dir = __dirname;
        while (true) {
            const candidate = path.join(dir, '__dist', exe);
            if (fs.existsSync(candidate)) {
                return candidate;
            }

            const parent = path.dirname(dir);
            if (parent === dir) {
                return 'lua';
            }

            dir = parent;
        }
    }

    public static processOptions(cmdLineArgs: string[]): any {
        const options = {};
        for (let i = 2; i < cmdLineArgs.length; i++) {
            const item = cmdLineArgs[i];
            if (!item || item[0] !== '-') {
                continue;
            }

            options[item.substring(1)] = true;
        }

        return options;
    }

    public static processFiles(cmdLineArgs: string[]): any {
        const options = [];
        for (let i = 2; i < cmdLineArgs.length; i++) {
            const item = cmdLineArgs[i];
            if (!item || item[0] === '-') {
                continue;
            }

            options.push(item);
        }

        if (options.length === 0) {
            return 'tsconfig.json';
        }

        return options.length === 1 ? options[0] : options;
    }

    public run(sourcesOrConfigFile: string[] | string, outputExtention: string, cmdLineOptions: any): void {

        if (typeof (sourcesOrConfigFile) === 'string') {
            if (sourcesOrConfigFile.endsWith('.json')) {
                const configPath = ts.findConfigFile('./', ts.sys.fileExists, sourcesOrConfigFile);
                if (configPath) {
                    this.compileWithConfig(configPath, outputExtention, cmdLineOptions);
                    return;
                } else {
                    throw new Error('Could not find a valid \'tsconfig.json\'.');
                }
            }

            this.compileSources([sourcesOrConfigFile], outputExtention, cmdLineOptions);
            return;
        }

        this.compileSources(sourcesOrConfigFile, outputExtention, cmdLineOptions);
    }

    public compileSources(sources: string[], outputExtention: string, cmdLineOptions: any): void {
        const options: ts.CompilerOptions = {};
        const rootNames = this.applyJsLib(sources, options, cmdLineOptions);
        this.generateBinary(ts.createProgram(rootNames, options), sources, outputExtention, options, cmdLineOptions);
    }

    public compileWithConfig(configPath: string, outputExtention: string, cmdLineOptions: any): void {
        const configFile = ts.readJsonConfigFile(configPath, ts.sys.readFile);

        const parseConfigHost: ts.ParseConfigHost = {
            useCaseSensitiveFileNames: true,
            readDirectory: ts.sys.readDirectory,
            fileExists: ts.sys.fileExists,
            readFile: ts.sys.readFile
        };

        // 'include'/'files' entries are resolved against this base path, and a relative one silently drops every
        // entry that reaches outside the config's own directory - no error, the file is just missing from the
        // program. tsc itself passes the directory holding the config, so do the same
        const basePath = path.dirname(path.resolve(configPath));

        const parsedCommandLine = ts.parseJsonSourceFileConfigFileContent(configFile, parseConfigHost, basePath);

        const watch = cmdLineOptions && 'watch' in cmdLineOptions;

        const options = parsedCommandLine.options;
        const rootNames = this.applyJsLib(parsedCommandLine.fileNames, options, cmdLineOptions);

        if (!watch) {
            // simple case, just compile
            const program = ts.createProgram({ rootNames, options });
            this.generateBinary(program, parsedCommandLine.fileNames, outputExtention, options, cmdLineOptions);
        } else {
            const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;

            // 'createWatchCompilerHost' offers no way to add a root file to a tsconfig, so a jslib
            // build watches the file list instead of the config: tsconfig.json stops being re-read,
            // and a newly added file matching 'include' is not picked up until the watcher restarts
            const watchCompilingHost = Helpers.isJsLib(options, cmdLineOptions)
                ? ts.createWatchCompilerHost(
                    rootNames,
                    options,
                    ts.sys,
                    createProgram,
                    (d) => this.reportDiagnostic(d),
                    (d) => this.reportWatchStatusChanged(d))
                : ts.createWatchCompilerHost(
                    configPath,
                    {},
                    ts.sys,
                    createProgram,
                    (d) => this.reportDiagnostic(d),
                    (d) => this.reportWatchStatusChanged(d));

            watchCompilingHost.afterProgramCreate = program => {
              this.generateBinary(
                  program.getProgram(),
                  parsedCommandLine.fileNames,
                  outputExtention,
                  options,
                  cmdLineOptions);
            };

            console.log(ForegroundColorEscapeSequences.Cyan + 'Watching...' + resetEscapeSequence);
            // the ternary above makes watchCompilingHost a union of the two host types; ts 3.9 can't
            // match a union argument against either overload of createWatchProgram, though at runtime
            // it is always exactly one concrete host shape
            ts.createWatchProgram(<any>watchCompilingHost);
        }
    }

    private reportDiagnostic(diagnostic: ts.Diagnostic) {

        const category = ts.DiagnosticCategory[diagnostic.category];

        let action;
        let color;
        switch (<ts.DiagnosticCategory>diagnostic.category) {
            case ts.DiagnosticCategory.Warning:
                action = console.warn;
                color = ForegroundColorEscapeSequences.Yellow;
                break;
            case ts.DiagnosticCategory.Error:
                action = console.error;
                color = ForegroundColorEscapeSequences.Red;
                break;
            case ts.DiagnosticCategory.Suggestion:
                action = console.warn;
                color = ForegroundColorEscapeSequences.White;
                break;
            case ts.DiagnosticCategory.Message:
                action = console.log;
                color = resetEscapeSequence;
                break;
        }

        action(category, this.formatHost.getNewLine());
        action(
            category,
            diagnostic.code,
            ':',
            ts.flattenDiagnosticMessageText(color + diagnostic.messageText + resetEscapeSequence, this.formatHost.getNewLine()));
    }

    private reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
        console.log(ts.formatDiagnostic(diagnostic, this.formatHost));
    }

    // JSLib.d.ts describes the jslib runtime as it really is, so it replaces the standard library
    // rather than adding to it: 'declare class Math' and lib.es5's 'declare var Math: Math' cannot
    // coexist. it goes into the root names only - 'sources' is what drives emission, and JSLib.d.ts
    // must not be emitted as JSLib.lua
    private applyJsLib(rootNames: string[], options: ts.CompilerOptions, cmdLineOptions: any): string[] {
        if (!Helpers.isJsLib(options, cmdLineOptions)) {
            return rootNames;
        }

        options.noLib = true;
        return [Helpers.findJsLibDts(), ...rootNames];
    }

    private generateBinary(
        program: ts.Program, sources: string[], outputExtention: string, options: ts.CompilerOptions, cmdLineOptions: any) {

        const binOutput = cmdLineOptions && cmdLineOptions.bin;
        console.log(ForegroundColorEscapeSequences.Pink + 'Generating ' + (binOutput ? 'Binary' : 'Text') + ' files...' + resetEscapeSequence);

        const sourceFiles = program.getSourceFiles();

        const isSingleModule = cmdLineOptions && cmdLineOptions.singleModule;
        if (!isSingleModule) {
            sourceFiles.filter(s => !s.fileName.endsWith('.d.ts') && sources.some(sf => s.fileName.endsWith(sf))).forEach(s => {
                // track version
                const paths = sources.filter(sf => s.fileName.endsWith(sf));
                (<any>s).__path = paths[0];
                const fileVersion = (<any>s).version;
                if (fileVersion) {
                    const latestVersion = this.versions[s.fileName];
                    if (latestVersion && parseInt(latestVersion) >= parseInt(fileVersion)) {
                        console.log(
                            'File: '
                            + ForegroundColorEscapeSequences.White
                            + s.fileName
                            + resetEscapeSequence
                            + ' current version:'
                            + fileVersion
                            + ', last version:'
                            + latestVersion
                            + '. '
                            + ForegroundColorEscapeSequences.Red
                            + 'Skipped.'
                            + resetEscapeSequence);
                        return;
                    }

                    this.versions[s.fileName] = fileVersion;
                }

                console.log(
                    ForegroundColorEscapeSequences.Cyan
                    + 'Processing File: '
                    + resetEscapeSequence
                    + ForegroundColorEscapeSequences.White
                    + s.fileName
                    + resetEscapeSequence);
                const emitter = !binOutput
                    ? new EmitterLua(program.getTypeChecker(), options, cmdLineOptions, false)
                    : new Emitter(program.getTypeChecker(), options, cmdLineOptions, false, program.getCurrentDirectory());

                emitter.processNode(s);
                emitter.save();

                const fileNamnNoExt = s.fileName.endsWith('.ts') ? s.fileName.substr(0, s.fileName.length - 3) : s.fileName;
                const fileName = Helpers.correctFileNameForLua(fileNamnNoExt.concat('.', outputExtention));

                console.log(
                    ForegroundColorEscapeSequences.Cyan
                    + 'Writing to file: '
                    + resetEscapeSequence
                    + ForegroundColorEscapeSequences.White
                    + s.fileName
                    + resetEscapeSequence);

                fs.writeFileSync(fileName, emitter.writer.getBytes());
            });
        } else {
            const emitter = !binOutput
                ? new EmitterLua(program.getTypeChecker(), options, cmdLineOptions, true)
                : new Emitter(program.getTypeChecker(), options, cmdLineOptions, true, program.getCurrentDirectory());
            sourceFiles.forEach(s => {
                const paths = sources.filter(sf => s.fileName.endsWith(sf));
                if (paths && paths.length > 0) {
                    (<any>s).__path = paths[0];
                    emitter.processNode(s);
                    console.log('File: ' + ForegroundColorEscapeSequences.White + s.fileName + resetEscapeSequence);
                }
            });

            const fileName = (emitter.fileModuleName || 'out').replace(/\./g, '_') + '.' + outputExtention;

            console.log(
                ForegroundColorEscapeSequences.Cyan
                + 'Writing to file '
                + resetEscapeSequence
                + ForegroundColorEscapeSequences.White
                + fileName
                + resetEscapeSequence);

            emitter.save();
            fs.writeFileSync(fileName, emitter.writer.getBytes());
        }

        console.log(ForegroundColorEscapeSequences.Pink + (binOutput ? 'Binary' : 'Text') + ' files have been generated...' + resetEscapeSequence);
    }

    public test(sources: string[], cmdLineOptions?: any): string {
        let actualOutput = '';

        this.withTestSources(sources, cmdLineOptions, (luaFile: string) => {
            const result: any = spawn.sync(Run.getLuaInterpreter(), [luaFile]);
            actualOutput = result.error
                ? result.error.stack
                : (<Uint8Array>result.stdout).toString();
        });

        return actualOutput;
    }

    // the generated lua of the last source, for tests asserting on the shape of the output
    // rather than on what it prints - running it would need JS.lua on the interpreter's path
    public testEmit(sources: string[], cmdLineOptions?: any): string {
        let luaText = '';

        this.withTestSources(sources, cmdLineOptions, (luaFile: string, text: string) => {
            luaText = text;
        });

        return luaText;
    }

    private withTestSources(
        sources: string[], cmdLineOptions: any, use: (luaFile: string, luaText: string) => void): void {

        const tempSourceFiles = sources.map((s: string, index: number) => 'test' + index + '.ts');
        const tempLuaFiles = sources.map((s: string, index: number) => 'test' + index + '.lua');

        const binOutput = cmdLineOptions && cmdLineOptions.bin;

        const cleanUp = () => {
            tempSourceFiles.forEach(f => {
                if (fs.existsSync(f)) { fs.unlinkSync(f); }
            });
            tempLuaFiles.forEach(f => {
                if (fs.existsSync(f)) { fs.unlinkSync(f); }
            });
        };

        cleanUp();

        try {
            sources.forEach((s: string, index: number) => {
                fs.writeFileSync('test' + index + '.ts', s.replace(/console\.log\(/g, 'print('));
            });

            const options: ts.CompilerOptions = {};
            const rootNames = this.applyJsLib(tempSourceFiles, options, cmdLineOptions);
            const program = ts.createProgram(rootNames, options);
            const emitResult = program.emit(undefined, (f, data, writeByteOrderMark) => {
                // ts.sys.writeFile(f, data, writeByteOrderMark);
            });

            emitResult.diagnostics.forEach((d: ts.Diagnostic) => {
                switch (d.category) {
                    case 1: throw new Error('Error: ' + d.messageText + ' file: ' + d.file + ' line: ' + d.start);
                    default: break;
                }
            });

            let lastLuaFile;
            let lastLuaText = '';
            const sourceFiles = program.getSourceFiles();
            sourceFiles.forEach((s: ts.SourceFile, index: number) => {
                const currentFile = tempSourceFiles.find(sf => s.fileName.endsWith(sf));
                if (currentFile) {
                    const emitter = !binOutput
                        ? new EmitterLua(program.getTypeChecker(), options, cmdLineOptions || {}, false)
                        : new Emitter(program.getTypeChecker(), options, cmdLineOptions || {}, false);
                    (<any>s).__path = currentFile;
                    emitter.processNode(s);
                    emitter.save();

                    const luaFile = currentFile.replace(/\.ts$/, '.lua');
                    const bytes = emitter.writer.getBytes();
                    fs.writeFileSync(luaFile, bytes);

                    lastLuaFile = luaFile;
                    lastLuaText = bytes.toString();
                }
            });

            use(lastLuaFile, lastLuaText);
        } catch (e) {
            cleanUp();
            throw e;
        }

        cleanUp();
    }
}
