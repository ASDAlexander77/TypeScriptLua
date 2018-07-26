import * as ts from "typescript";
import * as fs from "fs-extra";
import { Emitter } from './emitter';

export class Run {
    public run(sources: string[], output: string): void {
		/*
		const sourceFile = ts.createSourceFile("test.ts", fs.readFileSync("test.ts").toString(), ts.ScriptTarget.ES2018, false);

		const printer = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
		});

		const result = printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
		console.log(result);
		*/

        console.log('Compiling...');

        const program = ts.createProgram(sources, {});
        let emitResult = program.emit(undefined, (f) => {
            console.log('Emitting: ' + f);
        });

        emitResult.diagnostics.forEach(d => {
            let output = "";
            switch (d.category) {
                case 0: output = "Warning"; break;
                case 1: output = "Error"; break;
                case 2: output = "Suggestion"; break;
                case 3: output = "Message"; break;
            }

            console.log(output + ": " + d.messageText + " file: " + d.file + " line: " + d.start);
        })

        let sourceFiles = program.getSourceFiles();

        console.log('Generating binaries...');

        sourceFiles.forEach(s => {
            if (sources.some(sf => s.fileName.endsWith(sf))) {
                console.log('File: ' + s.fileName);

                const emitter = new Emitter(program.getTypeChecker());
                emitter.processNode(s);

                fs.writeFileSync(output, emitter.writer.getBytes());
            }
        })
    }

    public test(sources: string[], output: string): void {
        let tempSourceFiles = sources.map((s:string, index:number) => "test" + index + ".ts");
        let tempTestOutputFile = "testout.luabc";

        // clean up
        tempSourceFiles.forEach(f => fs.unlinkSync(f));
        fs.unlinkSync(tempTestOutputFile);

        try {
            sources.forEach((s:string, index:number) => {
                fs.writeFileSync("test" + index + ".ts", s);
            });

            const program = ts.createProgram(tempSourceFiles, {});
            let emitResult = program.emit(undefined, (f) => { });

            emitResult.diagnostics.forEach(d => {
                switch (d.category) {
                    case 1: throw new Error(output + ": " + d.messageText + " file: " + d.file + " line: " + d.start);
                    default: break;
                }
            })

            let sourceFiles = program.getSourceFiles();
            sourceFiles.forEach((s:ts.SourceFile, index:number) => {
                if (tempSourceFiles.some(sf => s.fileName.endsWith(sf))) {
                    const emitter = new Emitter(program.getTypeChecker());
                    emitter.processNode(s);

                    fs.writeFileSync(tempTestOutputFile, emitter.writer.getBytes());
                }
            })
        }
        catch (e) {
            // clean up
            tempSourceFiles.forEach(f => fs.unlinkSync(f));
            fs.unlinkSync(tempTestOutputFile);
            throw e;
        }

        // clean up
        tempSourceFiles.forEach(f => fs.unlinkSync(f));
        fs.unlinkSync(tempTestOutputFile);
    }
}
