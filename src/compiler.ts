import * as ts from "typescript";
import * as fs from "fs-extra";
import { Emitter } from './emitter';

export class Run {
	public run(sources:string[], output:string): void {
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
}
