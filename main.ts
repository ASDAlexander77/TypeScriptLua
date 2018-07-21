import * as ts from "typescript";
import * as fs from "fs";

class Run 
{
	public run(): void
	{
		console.log('Running...');

		const sourceFile = ts.createSourceFile("test.ts", fs.readFileSync("test.ts").toString(), ts.ScriptTarget.ES2018, false);

		const emitter = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
		});

		const result = emitter.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
		console.log(result);
	}
}

new Run().run();