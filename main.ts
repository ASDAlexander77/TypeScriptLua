import * as ts from "typescript";
import * as fs from "fs";
import { Emitter } from './emitter';

class Run 

{
	public run(): void
	{
		console.log('Running...');

		const sourceFile = ts.createSourceFile("test.ts", fs.readFileSync("test.ts").toString(), ts.ScriptTarget.ES2018, false);

		const printer = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
		});

		const result = printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
		console.log(result);

		const emitter = new Emitter();
		emitter.processNode(sourceFile);
	}
}

new Run().run();