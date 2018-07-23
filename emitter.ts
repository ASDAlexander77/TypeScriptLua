import * as ts from "typescript";
import { BinaryWriter } from './binarywriter';

class FunctionContext
{
    public debug_location: string;
    public linedefined: number;
    public lastlinedefined: number;
    public numparams: number;
    public is_vararg: boolean;
    public maxstacksize: number;
    public sizeupvalues: number;
    public code: Array<Array<number>>;
}

export class Emitter
{
    private writer: BinaryWriter = new BinaryWriter();
    private functionContextStack: Array<FunctionContext> = [];
    private functionContext: FunctionContext;

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

    private pushFunctionContext()
    {
        this.functionContextStack.push(this.functionContext);
        this.functionContext = new FunctionContext();
    }

    private popFunctionContext(): FunctionContext
    {
        let localFunctionContext = this.functionContext;
        this.functionContext = this.functionContextStack.pop();
        return localFunctionContext;
    }

    private processFunction(statements: ts.NodeArray<ts.Statement>): FunctionContext {
        this.pushFunctionContext();
        statements.forEach(s => {
            this.processStatement(s);
        });

        return this.popFunctionContext();
    }

    private processFile(sourceFile: ts.SourceFile): void 
    {
        this.emitHeader();
        
        let localFunctionContext = this.processFunction(sourceFile.statements);

        // this is global function
        localFunctionContext.is_vararg = true;

        this.emitFunction(localFunctionContext);
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

    private emitFunction(functionContext: FunctionContext): void 
    {
        this.emitFunctionHeader(functionContext);
        this.emitFunctionCode(functionContext);
    }

    private emitFunctionHeader(functionContext: FunctionContext): void 
    {
        // f->sizeupvalues (byte)
        this.writer.writeByte(functionContext.sizeupvalues);

        // write debug info, by default 0 (string)
        this.writer.writeString(functionContext.debug_location || null); 

        // f->linedefined = 0, (int)
        this.writer.writeInt(functionContext.linedefined || 0); 

        // f->lastlinedefined = 0, (int)
        this.writer.writeInt(functionContext.lastlinedefined || 0); 
        
        // f->numparams (byte)
        this.writer.writeByte(functionContext.numparams || 0); 
        
        // f->is_vararg (byte)
        this.writer.writeByte(functionContext.is_vararg ? 1 : 0); 
        
        // f->maxstacksize
        this.writer.writeByte(functionContext.maxstacksize); 
    }    

    private emitFunctionCode(functionContext: FunctionContext): void 
    {
        // f->sizecode
        this.writer.writeInt(4);         
    }    
}
