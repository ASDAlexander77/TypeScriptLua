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
        throw new Error("Method not implemented.");
    }

    private processFile(sourceFile: ts.SourceFile): void 
    {
        this.emitHeader();
        // f->sizeupvalues (byte)
        this.writer.writeByte(1);
        this.emitFunction(sourceFile.statements);
    }

    private processBundle(bundle: ts.Bundle): void 
    {
        throw new Error("Method not implemented.");
    }

    private processUnparsedSource(unparsedSource: ts.UnparsedSource): void 
    {
        throw new Error("Method not implemented.");
    }

    private processStatement(node: ts.Statement): void
    {
        switch (node.kind) 
        {
            case ts.SyntaxKind.ExpressionStatement: this.processExpressionStatement(<ts.ExpressionStatement>node); return;
        }

        // TODO: finish it
        throw new Error("Method not implemented.");        
    }

    private processExpressionStatement(node: ts.ExpressionStatement): void 
    {
        this.processExpression(node.expression);
    }

    private processExpression(node: ts.Expression): void 
    {
        switch (node.kind) 
        {
            case ts.SyntaxKind.CallExpression: this.processCallExpression(<ts.CallExpression>node); return;
        }
        
        // TODO: finish it
        throw new Error("Method not implemented.");        
    }    

    private processCallExpression(node: ts.CallExpression): void 
    {
    }

    private emitHeader(): void
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
    }

    private emitFunction(node: ts.NodeArray<ts.Statement>): void 
    {
        this.emitFunctionHeader();
        node.forEach(s => {
            this.processStatement(s);
        });
    }

    private emitFunctionHeader(): void 
    {
        // TODO: finish      
        // write debug info, by default 0 (string)
        this.writer.writeString(null); 

        // f->linedefined = 0, (int)
        this.writer.writeInt(0); 

        // f->lastlinedefined = 0, (int)
        this.writer.writeInt(0); 
        
        // f->numparams (byte)
        this.writer.writeByte(0); 
        
        // f->is_vararg (byte)
        this.writer.writeByte(0); 
        
        // f->maxstacksize
        this.writer.writeByte(2); 
    }    
}
