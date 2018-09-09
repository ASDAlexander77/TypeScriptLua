import * as ts from 'typescript';
import * as fs from 'fs-extra';
import { spawn } from 'cross-spawn';
import { Emitter } from './emitter';

export class Run {

    public run(sourcesOrConfigFile: string[] | string, outputExtention: string): void {
        if (typeof (sourcesOrConfigFile) === 'string') {
            if (sourcesOrConfigFile.endsWith('.json')) {
                const configPath = ts.findConfigFile('./', ts.sys.fileExists, sourcesOrConfigFile);
                if (configPath) {
                    this.compileWithConfig(configPath, outputExtention);
                    return;
                }
            }

            this.compileSources([sourcesOrConfigFile], outputExtention);
            return;
        }

        this.compileSources(sourcesOrConfigFile, outputExtention);
    }

    public compileSources(sources: string[], outputExtention: string): void {

        /*
		const sourceFile = ts.createSourceFile('test.ts', fs.readFileSync('test.ts').toString(), ts.ScriptTarget.ES2018, false);

		const printer = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
		});

		const result = printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
		console.log(result);
		*/

        this.generateBinary(this.createProgram(ts.createProgram(sources, {})), sources, outputExtention);
    }

    public compileWithConfig(configPath: string, outputExtention: string): void {
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
        this.generateBinary(program, parsedCommandLine.fileNames, outputExtention);
    }

    private createProgram(program: ts.Program): any {
        console.log('Compiling...');
        const emitResult = program.emit(undefined, (f, data, writeByteOrderMark) => {
            console.log('Emitting: ' + f);

            // TODO: comment it when not needed
            /// ts.sys.writeFile(f, data, writeByteOrderMark);
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

    private generateBinary(program: ts.Program, sources: string[], outputExtention: string) {
        const sourceFiles = program.getSourceFiles();
        console.log('Generating binaries...');
        sourceFiles.forEach(s => {
            if (sources.some(sf => s.fileName.endsWith(sf))) {
                console.log('File: ' + s.fileName);
                const emitter = new Emitter(program.getTypeChecker());
                emitter.processNode(s);
                fs.writeFileSync(s.fileName.split('.')[0].concat('.', outputExtention), emitter.writer.getBytes());
            }
        });
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
                    const emitter = new Emitter(program.getTypeChecker());
                    emitter.processNode(s);

                    const luaFile = currentFile.replace(/\.ts$/, '.lua');
                    fs.writeFileSync(luaFile, emitter.writer.getBytes());

                    lastLuaFile = luaFile;

                }
            });

            // start program and test it to
            const result: any = spawn.sync('__build/win64/lua/Debug/lua.exe', [lastLuaFile]);
            actualOutput = (<Uint8Array>result.stdout).toString();
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
