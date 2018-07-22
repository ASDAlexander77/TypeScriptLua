import * as ts from "typescript";
import { BinaryWriter } from './binarywriter';

export class Emitter
{
    private writer: BinaryWriter = new BinaryWriter();

    public processNode(node: ts.Node): void
    {
        switch (node.kind) 
        {
            case ts.SyntaxKind.SourceFile: this.processFile(<ts.SourceFile>node); return;
            case ts.SyntaxKind.Bundle: this.processBundle(<ts.Bundle>node); return;
            case ts.SyntaxKind.UnparsedSource: this.processUnparsedSource(<ts.UnparsedSource>node); return;
        }

        // TODO: finish it
    }

    private processFile(sourceFile: ts.SourceFile): void 
    {
        // writing header
        // LUA_SIGNATURE 
        this.writer.writeArray([0x1b,0x4c,0x75,0x61]);
        // LUAC_VERSION, LUAC_FORMAT
        this.writer.writeArray([0x53,0x00]);
        // LUAC_DATA: data to catch conversion errors
        this.writer.writeArray([0x19,0x93,0x0d,0x0a,0x1a,0x0a]);
        // sizeof(int), sizeof(size_t), sizeof(Instruction), sizeof(lua_Integer), sizeof(lua_Number)
        this.writer.writeArray([0x04,0x08,0x04,0x08,0x08]);
        // LUAC_INT
        this.writer.writeArray([0x78,0x56,0x0,0x0,0x0,0x0,0x0,0x0]);
        // LUAC_NUM
        this.writer.writeArray([0x0,0x0,0x0,0x0,0x0,0x28,0x77,0x40]);

        // TODO: write f->sizeupvalues(byte) + function
    }

    private processBundle(bundle: ts.Bundle): void 
    {
        throw new Error("Method not implemented.");
    }

    private processUnparsedSource(unparsedSource: ts.UnparsedSource): void 
    {
        throw new Error("Method not implemented.");
    }
}
