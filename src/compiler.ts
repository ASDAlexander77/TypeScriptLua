import * as ts from 'typescript';
import * as fs from 'fs-extra';
import { spawn } from 'cross-spawn';
import { Emitter } from './emitter';

export class Run {
    public run(sources: string[], output: string): void {

        /*
		const sourceFile = ts.createSourceFile('test.ts', fs.readFileSync('test.ts').toString(), ts.ScriptTarget.ES2018, false);

		const printer = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
		});

		const result = printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
		console.log(result);
		*/

        console.log('Compiling...');

        const program = ts.createProgram(sources, {});
        const emitResult = program.emit(undefined, (f) => {
            console.log('Emitting: ' + f);
        });

        emitResult.diagnostics.forEach(d => {
            let outputDiag = '';
            switch (d.category) {
                case 0: outputDiag = 'Warning'; break;
                case 1: outputDiag = 'Error'; break;
                case 2: outputDiag = 'Suggestion'; break;
                case 3: outputDiag = 'Message'; break;
            }

            console.log(outputDiag + ': ' + d.messageText + ' file: ' + d.file + ' line: ' + d.start);
        });

        const sourceFiles = program.getSourceFiles();

        console.log('Generating binaries...');

        sourceFiles.forEach(s => {
            if (sources.some(sf => s.fileName.endsWith(sf))) {
                console.log('File: ' + s.fileName);

                const emitter = new Emitter(program.getTypeChecker());
                emitter.processNode(s);

                fs.writeFileSync(output, emitter.writer.getBytes());
            }
        });
    }

    public test(sources: string[]): string {
        let actualOutput = '';

        const tempSourceFiles = sources.map((s: string, index: number) => 'test' + index + '.ts');
        const tempTestOutputFile = 'testout.luabc';

        // clean up
        tempSourceFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });
        if (fs.existsSync(tempTestOutputFile)) {
            fs.unlinkSync(tempTestOutputFile);
        }

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

            const sourceFiles = program.getSourceFiles();
            sourceFiles.forEach((s: ts.SourceFile, index: number) => {
                if (tempSourceFiles.some(sf => s.fileName.endsWith(sf))) {
                    const emitter = new Emitter(program.getTypeChecker());
                    emitter.processNode(s);

                    fs.writeFileSync(tempTestOutputFile, emitter.writer.getBytes());

                    // start program and test it to
                    const result: any = spawn.sync('__build/win64/lua/Debug/lua.exe', [tempTestOutputFile]);
                    actualOutput = (<Uint8Array>result.stdout).toString().trim();
                }
            });
        } catch (e) {
            // clean up
            tempSourceFiles.forEach(f => fs.unlinkSync(f));
            fs.unlinkSync(tempTestOutputFile);
            throw e;
        }

        // clean up
        tempSourceFiles.forEach(f => fs.unlinkSync(f));
        fs.unlinkSync(tempTestOutputFile);

        return actualOutput;
    }
}
