import * as ts from 'typescript';
import * as fs from 'fs-extra';
import { spawn } from 'cross-spawn';
import { Emitter } from './emitter';
import { Helpers } from './helpers';

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
        this.generateBinary(ts.createProgram(sources, {}), sources, outputExtention, undefined, cmdLineOptions);
    }

    public compileWithConfig(configPath: string, outputExtention: string, cmdLineOptions: any): void {
        const configFile = ts.readJsonConfigFile(configPath, ts.sys.readFile);

        const parseConfigHost: ts.ParseConfigHost = {
            useCaseSensitiveFileNames: false,
            readDirectory: ts.sys.readDirectory,
            fileExists: ts.sys.fileExists,
            readFile: ts.sys.readFile
        };

        const parsedCommandLine = ts.parseJsonSourceFileConfigFileContent(configFile, parseConfigHost, './');

        const watch = cmdLineOptions && 'watch' in cmdLineOptions;

        if (!watch) {
            // simple case, just compile
            const program = ts.createProgram({
                rootNames: parsedCommandLine.fileNames,
                options: parsedCommandLine.options
            });
            this.generateBinary(program, parsedCommandLine.fileNames, outputExtention, parsedCommandLine.options, cmdLineOptions);
        } else {
            const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;

            const watchCompilingHost = ts.createWatchCompilerHost(
                configPath,
                {},
                ts.sys,
                createProgram,
                (d) => this.reportDiagnostic(d),
                (d) => this.reportWatchStatusChanged(d)
            );

            watchCompilingHost.afterProgramCreate = program => {
              this.generateBinary(
                  program.getProgram(),
                  parsedCommandLine.fileNames,
                  outputExtention,
                  parsedCommandLine.options,
                  cmdLineOptions);
            };

            ts.createWatchProgram(watchCompilingHost);
        }
    }

    private reportDiagnostic(diagnostic: ts.Diagnostic) {

        const category = ts.DiagnosticCategory[diagnostic.category];

        let action;
        switch (<ts.DiagnosticCategory>diagnostic.category) {
            case ts.DiagnosticCategory.Warning:
                action = console.warn;
                break;
            case ts.DiagnosticCategory.Error:
                action = console.error;
                break;
            case ts.DiagnosticCategory.Suggestion:
                action = console.warn;
                break;
            case ts.DiagnosticCategory.Message:
                action = console.log;
                break;
        }

        action(category, this.formatHost.getNewLine());
        action(category, diagnostic.code, ':', ts.flattenDiagnosticMessageText(diagnostic.messageText, this.formatHost.getNewLine()));
    }

    private reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
        console.log(ts.formatDiagnostic(diagnostic, this.formatHost));
    }

    private generateBinary(
        program: ts.Program, sources: string[], outputExtention: string, options: ts.CompilerOptions, cmdLineOptions: any) {

        console.log('Generating binary files...');

        const sourceFiles = program.getSourceFiles();

        const isSingleModule = cmdLineOptions && cmdLineOptions.singleModule;
        if (!isSingleModule) {
            sourceFiles.filter(s => !s.fileName.endsWith('.d.ts') && sources.some(sf => s.fileName.endsWith(sf))).forEach(s => {
                // track version
                const fileVersion = (<any>s).version;
                if (fileVersion) {
                    const latestVersion = this.versions[s.fileName];
                    if (latestVersion && latestVersion >= fileVersion) {
                        return;
                    }

                    this.versions[s.fileName] = fileVersion;
                }

                console.log('File: ' + s.fileName);
                const emitter = new Emitter(program.getTypeChecker(), options, cmdLineOptions, program.getCurrentDirectory());

                emitter.processNode(s);
                emitter.save();

                const fileNamnNoExt = s.fileName.endsWith('.ts') ? s.fileName.substr(0, s.fileName.length - 3) : s.fileName;
                const fileName = Helpers.correctFileNameForLua(fileNamnNoExt.concat('.', outputExtention));

                console.log('Writing to file ' + fileName);

                fs.writeFileSync(fileName, emitter.writer.getBytes());
            });
        } else {
            const emitter = new Emitter(program.getTypeChecker(), options, cmdLineOptions, program.getCurrentDirectory());
            sourceFiles.forEach(s => {
                if (sources.some(sf => s.fileName.endsWith(sf))) {
                    emitter.processNode(s);
                    console.log('File: ' + s.fileName);
                }
            });

            const fileName = (emitter.fileModuleName || 'out').replace(/\./g, '_') + '.' + outputExtention;

            console.log('Writing to file ' + fileName);

            emitter.save();
            fs.writeFileSync(fileName, emitter.writer.getBytes());
        }

        console.log('Binary files have been generated...');
    }

    public test(sources: string[], cmdLineOptions?: any): string {
        let actualOutput = '';

        const tempSourceFiles = sources.map((s: string, index: number) => 'test' + index + '.ts');
        const tempLuaFiles = sources.map((s: string, index: number) => 'test' + index + '.lua');

        // clean up
        tempSourceFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });
        tempLuaFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });

        try {
            sources.forEach((s: string, index: number) => {
                fs.writeFileSync('test' + index + '.ts', s.replace(/console\.log\(/g, 'print('));
            });

            const program = ts.createProgram(tempSourceFiles, {});
            const emitResult = program.emit(undefined, (f) => { });

            emitResult.diagnostics.forEach((d: ts.Diagnostic) => {
                switch (d.category) {
                    case 1: throw new Error('Error: ' + d.messageText + ' file: ' + d.file + ' line: ' + d.start);
                    default: break;
                }
            });

            let lastLuaFile;
            const sourceFiles = program.getSourceFiles();
            sourceFiles.forEach((s: ts.SourceFile, index: number) => {
                const currentFile = tempSourceFiles.find(sf => s.fileName.endsWith(sf));
                if (currentFile) {
                    const emitter = new Emitter(program.getTypeChecker(), undefined, cmdLineOptions || {});
                    emitter.processNode(s);
                    emitter.save();

                    const luaFile = currentFile.replace(/\.ts$/, '.lua');
                    fs.writeFileSync(luaFile, emitter.writer.getBytes());

                    lastLuaFile = luaFile;

                }
            });

            // start program and test it to
            const result: any = spawn.sync('__build/win64/lua/Debug/lua.exe', [lastLuaFile]);
            if (result.error) {
                actualOutput = result.error.stack;
            } else {
                actualOutput = (<Uint8Array>result.stdout).toString();
            }
        } catch (e) {
            // clean up
            tempSourceFiles.forEach(f => {
                if (fs.existsSync(f)) { fs.unlinkSync(f); }
            });
            tempLuaFiles.forEach(f => {
                if (fs.existsSync(f)) { fs.unlinkSync(f); }
            });

            throw e;
        }

        // clean up
        tempSourceFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });
        tempLuaFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });

        return actualOutput;
    }
}
