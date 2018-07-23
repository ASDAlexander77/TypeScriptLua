import * as ts from "typescript";
import { BinaryWriter } from './binarywriter';
import { FunctionContext } from './contexts';
import { IdentifierResolver, ResolvedInfo } from './resolvers';
import { Ops, opmode, OpCodes, LuaTypes } from './opcodes';

export class Emitter {
    public writer: BinaryWriter = new BinaryWriter();
    private resolver: IdentifierResolver = new IdentifierResolver();
    private functionContextStack: Array<FunctionContext> = [];
    private functionContext: FunctionContext;

    public processNode(node: ts.Node): void {
        switch (node.kind) {
            case ts.SyntaxKind.SourceFile: this.processFile(<ts.SourceFile>node); return;
            case ts.SyntaxKind.Bundle: this.processBundle(<ts.Bundle>node); return;
            case ts.SyntaxKind.UnparsedSource: this.processUnparsedSource(<ts.UnparsedSource>node); return;
        }

        // TODO: finish it
        throw new Error("Method not implemented.");
    }

    private pushFunctionContext() {
        this.functionContextStack.push(this.functionContext);
        this.functionContext = new FunctionContext();
    }

    private popFunctionContext(): FunctionContext {
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

    private processFile(sourceFile: ts.SourceFile): void {
        this.emitHeader();

        let localFunctionContext = this.processFunction(sourceFile.statements);

        // this is global function
        localFunctionContext.is_vararg = true;

        // add final "RETURN"
        localFunctionContext.code.push([Ops.RETURN, 0, 1]);

        this.emitFunction(localFunctionContext);
    }

    private processBundle(bundle: ts.Bundle): void {
        throw new Error("Method not implemented.");
    }

    private processUnparsedSource(unparsedSource: ts.UnparsedSource): void {
        throw new Error("Method not implemented.");
    }

    private processStatement(node: ts.Statement): void {
        switch (node.kind) {
            case ts.SyntaxKind.ExpressionStatement: this.processExpressionStatement(<ts.ExpressionStatement>node); return;
        }

        // TODO: finish it
        throw new Error("Method not implemented.");
    }

    private processExpressionStatement(node: ts.ExpressionStatement): void {
        this.processExpression(node.expression);
    }

    private processExpression(node: ts.Expression): void {
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression: this.processCallExpression(<ts.CallExpression>node); return;
            case ts.SyntaxKind.PropertyAccessExpression: this.processPropertyAccessExpression(<ts.PropertyAccessExpression>node); return;
            case ts.SyntaxKind.StringLiteral: this.processStringLiteral(<ts.StringLiteral>node); return;
            case ts.SyntaxKind.Identifier: this.processIndentifier(<ts.Identifier>node); return;
        }

        // TODO: finish it
        throw new Error("Method not implemented.");
    }

    private processStringLiteral(node: ts.StringLiteral): void {
        this.functionContext.code.push([Ops.LOADK, 1, -this.functionContext.findOrCreateConst(node.text)]);
    }

    private processCallExpression(node: ts.CallExpression): void {
        // method
        this.processExpression(node.expression);

        // arguments
        node.arguments.forEach(a => {
            this.processExpression(a);
        });

        // call, C = 1 means NO RETURN
        this.functionContext.code.push([Ops.CALL, 0, node.arguments.length + 1, 1]);
    }

    private processIndentifier(node: ts.Identifier): void {
        let identifierInfo = this.resolver.resolver(<ts.Identifier>node, this.functionContext);
        if (identifierInfo.value != undefined) {
            (<any>node).resolved_value = identifierInfo;
            return;
        }

        // TODO: finish it
        throw new Error("Method not implemented.");
    }

    private processPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        this.processExpression(node.expression);

        (<any>node.name).resolved_owner = node.expression;

        this.processExpression(node.name);

        // if it simple expression of identifier
        if ((<any>node.expression).resolved_value && (<any>node.name).resolved_value) {
            // then it is simple Table lookup
            let objectIdentifierInfo = <ResolvedInfo>(<any>node.expression).resolved_value;
            let methodIdentifierInfo = <ResolvedInfo>(<any>node.name).resolved_value;
            this.functionContext.code.push([Ops.GETTABUP, 0, objectIdentifierInfo.value, methodIdentifierInfo.value]);
            return;
        }

        ////this.functionContext.code.push([Ops.GETTABLE, 0, 2, 1]);

        // TODO: finish it
        throw new Error("Method not implemented.");
    }

    private emitHeader(): void {
        // writing header
        // LUA_SIGNATURE 
        this.writer.writeArray([0x1b, 0x4c, 0x75, 0x61]);
        // LUAC_VERSION, LUAC_FORMAT
        this.writer.writeArray([0x53, 0x00]);
        // LUAC_DATA: data to catch conversion errors
        this.writer.writeArray([0x19, 0x93, 0x0d, 0x0a, 0x1a, 0x0a]);
        // sizeof(int), sizeof(size_t), sizeof(Instruction), sizeof(lua_Integer), sizeof(lua_Number)
        this.writer.writeArray([0x04, 0x08, 0x04, 0x08, 0x08]);
        // LUAC_INT
        this.writer.writeArray([0x78, 0x56, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
        // LUAC_NUM
        this.writer.writeArray([0x0, 0x0, 0x0, 0x0, 0x0, 0x28, 0x77, 0x40]);
    }

    private emitFunction(functionContext: FunctionContext): void {
        this.emitFunctionHeader(functionContext);
        this.emitFunctionCode(functionContext);
        this.emitConstants(functionContext);
    }

    private emitFunctionHeader(functionContext: FunctionContext): void {
        // f->sizeupvalues (byte)
        this.writer.writeByte(functionContext.upvalues.length);

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

    private emitFunctionCode(functionContext: FunctionContext): void {
        this.writer.writeInt(functionContext.code.length);

        functionContext.code.forEach(c => {
            // create 4 bytes value
            let opCodeMode:opmode = OpCodes[c[0]];
            let encoded = opCodeMode.encode(c);
            this.writer.writeInt(encoded);
        });
    }

    private emitConstants(functionContext: FunctionContext): void {
        this.writer.writeInt(functionContext.contants.length);

        functionContext.contants.forEach(c => {
            // create 4 bytes value
            switch (typeof c)
            {
                case "boolean": 
                    this.writer.writeByte(LuaTypes.LUA_TBOOLEAN);
                    this.writer.writeByte(c);
                    break;
                case "number": 
                    this.writer.writeByte(LuaTypes.LUA_TNUMBER);
                    this.writer.writeNumber(c);
                    break;
                case "string": 
                    if ((<string>c).length > 255)
                    {
                        this.writer.writeByte(LuaTypes.LUA_TLNGSTR);
                    }
                    else
                    {
                        this.writer.writeByte(LuaTypes.LUA_TSTRING);
                    }

                    this.writer.writeString(c);
                    break;
                default: throw new Error("Method not implemeneted");
            }           
        });
    }    
}
