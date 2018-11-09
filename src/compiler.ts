import * as ts from 'typescript';
import * as fs from 'fs-extra';
import { spawn } from 'cross-spawn';
import { Emitter } from './emitter';

export class Run {

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

        return options.length === 1 ? options[0] : options;
    }

    public run(sourcesOrConfigFile: string[] | string, outputExtention: string, cmdLineOptions: any): void {
        if (typeof (sourcesOrConfigFile) === 'string') {
            if (sourcesOrConfigFile.endsWith('.json')) {
                const configPath = ts.findConfigFile('./', ts.sys.fileExists, sourcesOrConfigFile);
                if (configPath) {
                    this.compileWithConfig(configPath, outputExtention, cmdLineOptions);
                    return;
                }
            }

            this.compileSources([sourcesOrConfigFile], outputExtention, cmdLineOptions);
            return;
        }

        this.compileSources(sourcesOrConfigFile, outputExtention, cmdLineOptions);
    }

    public compileSources(sources: string[], outputExtention: string, cmdLineOptions: any): void {
        this.generateBinary(this.createProgram(ts.createProgram(sources, {})), sources, outputExtention, undefined, cmdLineOptions);
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

        const program = this.createProgram(ts.createProgram({
            rootNames: parsedCommandLine.fileNames,
            options: parsedCommandLine.options
        }));
        this.generateBinary(program, parsedCommandLine.fileNames, outputExtention, parsedCommandLine.options, cmdLineOptions);
    }

    private createProgram(program: ts.Program): any {
        console.log('Compiling...');
        const emitResult = program.emit(undefined, (f, data, writeByteOrderMark) => {
            console.log('Emitting: ' + f);

            // TODO: comment it when not needed
            // ts.sys.writeFile(f, data, writeByteOrderMark);
        });

        emitResult.diagnostics.forEach(d => {
            let outputDiag = '';
            switch (d.category) {
                case 0:
                    outputDiag = 'Warning';
                    break;
                case 1:
                    outputDiag = 'Error';
                    break;
                case 2:
                    outputDiag = 'Suggestion';
                    break;
                case 3:
                    outputDiag = 'Message';
                    break;
            }

            console.log(outputDiag + ': ' + d.messageText + ' file: ' + d.file + ' line: ' + d.start);
        });

        return program;
    }

    private generateBinary(
        program: ts.Program, sources: string[], outputExtention: string, options: ts.CompilerOptions, cmdLineOptions: any) {
        const sourceFiles = program.getSourceFiles();

        const isSingleModule = cmdLineOptions && cmdLineOptions.singleModule;
        if (!isSingleModule) {
            console.log('Generating binaries...');
            sourceFiles.forEach(s => {
                if (sources.some(sf => s.fileName.endsWith(sf))) {
                    console.log('File: ' + s.fileName);
                    const emitter = new Emitter(program.getTypeChecker(), options, cmdLineOptions);

                    emitter.processNode(s);
                    emitter.save();

                    const fileNamnNoExt = s.fileName.endsWith('.ts') ? s.fileName.substr(0, s.fileName.length - 3) : s.fileName;
                    const fileName = fileNamnNoExt.replace(/\./g, '_').concat('.', outputExtention);

                    console.log('Writing to file ' + fileName);

                    fs.writeFileSync(fileName, emitter.writer.getBytes());
                }
            });
        } else {
            console.log('Generating single binary...');
            const emitter = new Emitter(program.getTypeChecker(), options, cmdLineOptions);
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
    }

    public test(sources: string[]): string {
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
                fs.writeFileSync('test' + index + '.ts', s);
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
                    const emitter = new Emitter(program.getTypeChecker(), undefined, {});
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
