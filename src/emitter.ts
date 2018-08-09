import * as ts from 'typescript';
import { BinaryWriter } from './binarywriter';
import { FunctionContext, UpvalueInfo } from './contexts';
import { IdentifierResolver, ResolvedInfo, ResolvedKind } from './resolvers';
import { Ops, OpMode, OpCodes, LuaTypes } from './opcodes';
import { Helpers } from './helpers';

export class Emitter {
    public writer: BinaryWriter = new BinaryWriter();
    private functionContextStack: Array<FunctionContext> = [];
    private functionContext: FunctionContext;
    private resolver: IdentifierResolver;
    private opsMap = [];

    public constructor(typeChecker: ts.TypeChecker) {
        this.resolver = new IdentifierResolver(typeChecker);

        this.opsMap[ts.SyntaxKind.PlusToken] = Ops.ADD;
        this.opsMap[ts.SyntaxKind.MinusToken] = Ops.SUB;
        this.opsMap[ts.SyntaxKind.AsteriskToken] = Ops.MUL;
        this.opsMap[ts.SyntaxKind.PercentToken] = Ops.MOD;
        this.opsMap[ts.SyntaxKind.AsteriskAsteriskToken] = Ops.POW;
        this.opsMap[ts.SyntaxKind.SlashToken] = Ops.DIV;
        this.opsMap[ts.SyntaxKind.AmpersandToken] = Ops.BAND;
        this.opsMap[ts.SyntaxKind.BarToken] = Ops.BOR;
        this.opsMap[ts.SyntaxKind.CaretToken] = Ops.BXOR;
        this.opsMap[ts.SyntaxKind.LessThanLessThanToken] = Ops.SHL;
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanToken] = Ops.SHR;
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken] = Ops.SHR;
        this.opsMap[ts.SyntaxKind.EqualsEqualsToken] = Ops.EQ;
        this.opsMap[ts.SyntaxKind.EqualsEqualsEqualsToken] = Ops.EQ;
        this.opsMap[ts.SyntaxKind.LessThanToken] = Ops.LT;
        this.opsMap[ts.SyntaxKind.LessThanEqualsToken] = Ops.LE;
        this.opsMap[ts.SyntaxKind.ExclamationEqualsToken] = Ops.EQ;
        this.opsMap[ts.SyntaxKind.ExclamationEqualsEqualsToken] = Ops.EQ;
        this.opsMap[ts.SyntaxKind.GreaterThanToken] = Ops.LE;
        this.opsMap[ts.SyntaxKind.GreaterThanEqualsToken] = Ops.LT;

        this.opsMap[ts.SyntaxKind.PlusEqualsToken] = Ops.ADD;
        this.opsMap[ts.SyntaxKind.MinusEqualsToken] = Ops.SUB;
        this.opsMap[ts.SyntaxKind.AsteriskEqualsToken] = Ops.MUL;
        this.opsMap[ts.SyntaxKind.PercentEqualsToken] = Ops.MOD;
        this.opsMap[ts.SyntaxKind.AsteriskAsteriskEqualsToken] = Ops.POW;
        this.opsMap[ts.SyntaxKind.SlashEqualsToken] = Ops.DIV;
        this.opsMap[ts.SyntaxKind.AmpersandEqualsToken] = Ops.BAND;
        this.opsMap[ts.SyntaxKind.BarEqualsToken] = Ops.BOR;
        this.opsMap[ts.SyntaxKind.CaretEqualsToken] = Ops.BXOR;
        this.opsMap[ts.SyntaxKind.LessThanLessThanEqualsToken] = Ops.SHL;
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanEqualsToken] = Ops.SHR;
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken] = Ops.SHR;
    }

    public processNode(node: ts.Node): void {
        switch (node.kind) {
            case ts.SyntaxKind.SourceFile: this.processFile(<ts.SourceFile>node); return;
            case ts.SyntaxKind.Bundle: this.processBundle(<ts.Bundle>node); return;
            case ts.SyntaxKind.UnparsedSource: this.processUnparsedSource(<ts.UnparsedSource>node); return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private pushFunctionContext(location: ts.Node) {
        const localFunctionContext = this.functionContext;
        this.functionContextStack.push(localFunctionContext);
        this.functionContext = new FunctionContext();
        this.functionContext.container = localFunctionContext;
        this.functionContext.function_or_file_location_node = location;
    }

    private popFunctionContext(): FunctionContext {
        const localFunctionContext = this.functionContext;
        this.functionContext = this.functionContextStack.pop();
        return localFunctionContext;
    }

    private processFunction(
        location: ts.Node, statements: ts.NodeArray<ts.Statement>, parameters: ts.NodeArray<ts.ParameterDeclaration>): FunctionContext {
        this.pushFunctionContext(location);

        let createThis = false;
        function checkThisKeyward(node: ts.Node): any {
            if (node.kind === ts.SyntaxKind.ThisKeyword) {
                createThis = true;
                return true;
            }

            ts.forEachChild(node, checkThisKeyward);
        }

        ts.forEachChild(location, checkThisKeyward);

        if (createThis) {
            this.functionContext.createLocal('this');
        }

        parameters.forEach(p => {
            this.functionContext.createLocal((<ts.Identifier>p.name).text);
        });

        statements.forEach(s => {
            this.processStatement(s);
        });

        // add final 'RETURN'
        this.functionContext.code.push([Ops.RETURN, 0, 1]);

        return this.popFunctionContext();
    }

    private processFile(sourceFile: ts.SourceFile): void {

        this.emitHeader();

        const localFunctionContext = this.processFunction(sourceFile, sourceFile.statements, <any>[]);

        // this is global function
        localFunctionContext.is_vararg = true;

        // f->sizeupvalues (byte)
        this.writer.writeByte(localFunctionContext.upvalues.length);
        this.emitFunction(localFunctionContext);
    }

    private processBundle(bundle: ts.Bundle): void {
        throw new Error('Method not implemented.');
    }

    private processUnparsedSource(unparsedSource: ts.UnparsedSource): void {
        throw new Error('Method not implemented.');
    }

    private processStatement(node: ts.Statement): void {
        switch (node.kind) {
            case ts.SyntaxKind.EmptyStatement: return;
            case ts.SyntaxKind.VariableStatement: this.processVariableStatement(<ts.VariableStatement>node); return;
            case ts.SyntaxKind.FunctionDeclaration: this.processFunctionDeclaration(<ts.FunctionDeclaration>node); return;
            case ts.SyntaxKind.Block: this.processBlock(<ts.Block>node); return;
            case ts.SyntaxKind.ReturnStatement: this.processReturnStatement(<ts.ReturnStatement>node); return;
            case ts.SyntaxKind.IfStatement: this.processIfStatement(<ts.IfStatement>node); return;
            case ts.SyntaxKind.DoStatement: this.processDoStatement(<ts.DoStatement>node); return;
            case ts.SyntaxKind.WhileStatement: this.processWhileStatement(<ts.WhileStatement>node); return;
            case ts.SyntaxKind.ForStatement: this.processForStatement(<ts.ForStatement>node); return;
            case ts.SyntaxKind.ForInStatement: this.processForInStatement(<ts.ForInStatement>node); return;
            case ts.SyntaxKind.BreakStatement: this.processBreakStatement(<ts.BreakStatement>node); return;
            case ts.SyntaxKind.ContinueStatement: this.processContinueStatement(<ts.ContinueStatement>node); return;
            case ts.SyntaxKind.ExpressionStatement: this.processExpressionStatement(<ts.ExpressionStatement>node); return;
            case ts.SyntaxKind.EnumDeclaration: this.processEnumDeclaration(<ts.EnumDeclaration>node); return;
            case ts.SyntaxKind.DebuggerStatement: this.processDebuggerStatement(<ts.DebuggerStatement>node); return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processExpression(node: ts.Expression): void {
        switch (node.kind) {
            case ts.SyntaxKind.NewExpression: this.processNewExpression(<ts.NewExpression>node); return;
            case ts.SyntaxKind.CallExpression: this.processCallExpression(<ts.CallExpression>node); return;
            case ts.SyntaxKind.PropertyAccessExpression: this.processPropertyAccessExpression(<ts.PropertyAccessExpression>node); return;
            case ts.SyntaxKind.PrefixUnaryExpression: this.processPrefixUnaryExpression(<ts.PrefixUnaryExpression>node); return;
            case ts.SyntaxKind.PostfixUnaryExpression: this.processPostfixUnaryExpression(<ts.PostfixUnaryExpression>node); return;
            case ts.SyntaxKind.BinaryExpression: this.processBinaryExpression(<ts.BinaryExpression>node); return;
            case ts.SyntaxKind.ConditionalExpression: this.processConditionalExpression(<ts.ConditionalExpression>node); return;
            case ts.SyntaxKind.DeleteExpression: this.processDeleteExpression(<ts.DeleteExpression>node); return;
            case ts.SyntaxKind.FunctionExpression: this.processFunctionExpression(<ts.FunctionExpression>node); return;
            case ts.SyntaxKind.ArrowFunction: this.processArrowFunction(<ts.ArrowFunction>node); return;
            case ts.SyntaxKind.ElementAccessExpression: this.processElementAccessExpression(<ts.ElementAccessExpression>node); return;
            case ts.SyntaxKind.ParenthesizedExpression: this.processParenthesizedExpression(<ts.ParenthesizedExpression>node); return;
            case ts.SyntaxKind.VariableDeclarationList: this.processVariableDeclarationList(<ts.VariableDeclarationList><any>node); return;
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword: this.processBooleanLiteral(<ts.BooleanLiteral>node); return;
            case ts.SyntaxKind.NullKeyword: this.processNullLiteral(<ts.NullLiteral>node); return;
            case ts.SyntaxKind.NumericLiteral: this.processNumericLiteral(<ts.NumericLiteral>node); return;
            case ts.SyntaxKind.StringLiteral: this.processStringLiteral(<ts.StringLiteral>node); return;
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                this.processNoSubstitutionTemplateLiteral(<ts.NoSubstitutionTemplateLiteral>node); return;
            case ts.SyntaxKind.ObjectLiteralExpression: this.processObjectLiteralExpression(<ts.ObjectLiteralExpression>node); return;
            case ts.SyntaxKind.TemplateExpression: this.processTemplateExpression(<ts.TemplateExpression>node); return;
            case ts.SyntaxKind.ArrayLiteralExpression: this.processArrayLiteralExpression(<ts.ArrayLiteralExpression>node); return;
            case ts.SyntaxKind.ThisKeyword: this.processThisExpression(<ts.ThisExpression>node); return;
            case ts.SyntaxKind.Identifier: this.processIndentifier(<ts.Identifier>node); return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processExpressionStatement(node: ts.ExpressionStatement): void {
        this.processExpression(node.expression);
    }

    private transpileTSNode(node: ts.Node) {
        const result = ts.transpileModule(node.getFullText(), {
            compilerOptions: { module: ts.ModuleKind.CommonJS }
        });

        const sourceFile = ts.createSourceFile(
            'partial',
            result.outputText,
            ts.ScriptTarget.ES5,
            /*setParentNodes */ true
        );

        sourceFile.statements.forEach(s => {
            this.processStatement(s);
        });
    }

    private processDebuggerStatement(node: ts.DebuggerStatement): void {
        // prepare call for _ENV "pairs"
        // prepare consts
        const envInfo = this.resolver.returnResolvedEnv(this.functionContext);
        const debugMethodInfo = this.resolver.returnConst('debug', this.functionContext);

        const debugResultInfo = this.functionContext.useRegisterAndPush();
        // getting method referene
        this.functionContext.code.push(
            [Ops.GETTABUP, debugResultInfo.getRegister(), envInfo.getRegisterOrIndex(), debugMethodInfo.getRegisterOrIndex()]);
        this.functionContext.code.push(
            [Ops.GETTABLE, debugResultInfo.getRegister(), debugResultInfo.getRegister(), debugMethodInfo.getRegisterOrIndex()]);

        // finally - calling method 'debug.debug()'
        this.functionContext.code.push([Ops.CALL, debugResultInfo.getRegister(), 1, 1]);
        this.functionContext.stack.pop();
    }

    private processEnumDeclaration(node: ts.EnumDeclaration): void {
        this.transpileTSNode(node);
    }

    private processVariableDeclarationList(declarationList: ts.VariableDeclarationList): void {
        declarationList.declarations.forEach(
            d => this.processVariableDeclarationOne(d.name.getText(), d.initializer, Helpers.isConstOrLet(declarationList)));
    }

    private processVariableDeclarationOne(name: string, initializer: ts.Expression, isLetOrConst: boolean) {
        const localVar = this.functionContext.findScopedLocal(name, true);
        if (isLetOrConst && localVar === -1) {
            const localVarRegisterInfo = this.functionContext.createLocal(name);
            if (initializer) {
                this.processExpression(initializer);
            } else {
                this.processNullLiteral(null);
            }

            const rightNode = this.functionContext.stack.pop();
            this.functionContext.code.push([Ops.MOVE, localVarRegisterInfo.getRegister(), rightNode.getRegister()]);
        } else if (localVar !== -1) {
            if (initializer) {
                const localVarRegisterInfo = this.resolver.returnLocal(name, this.functionContext);
                this.processExpression(initializer);
                const rightNode = this.functionContext.stack.pop();
                this.functionContext.code.push([Ops.MOVE, localVarRegisterInfo.getRegister(), rightNode.getRegister()]);
            }
        } else {
            const nameConstIndex = -this.functionContext.findOrCreateConst(name);
            if (initializer) {
                this.processExpression(initializer);
                this.emitStoreToEnvObjectProperty(nameConstIndex);
            }
        }
    }

    private processVariableStatement(node: ts.VariableStatement): void {
        this.processVariableDeclarationList(node.declarationList);
    }

    private emitStoreToEnvObjectProperty(nameConstIndex: number) {
        const resolvedInfo = this.functionContext.stack.pop().optimize();

        this.functionContext.code.push([
            Ops.SETTABUP,
            this.resolver.returnResolvedEnv(this.functionContext).getRegisterOrIndex(),
            nameConstIndex,
            resolvedInfo.getRegisterOrIndex()]);
    }

    private processFunctionExpression(node: ts.FunctionExpression): void {
        const protoIndex = -this.functionContext.createProto(this.processFunction(node, node.body.statements, node.parameters));
        const resultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([Ops.CLOSURE, resultInfo.getRegister(), protoIndex]);
    }

    private processArrowFunction(node: ts.ArrowFunction): void {

        if (node.body.kind !== ts.SyntaxKind.Block) {
            throw new Error('Arrow function as expression is not implemented yet');
        }

        this.processFunctionExpression(<any>node);
    }

    private processFunctionDeclaration(node: ts.FunctionDeclaration): void {
        const nameConstIndex = -this.functionContext.findOrCreateConst(node.name.text);
        this.processFunctionExpression(<ts.FunctionExpression><any>node);

        this.emitStoreToEnvObjectProperty(nameConstIndex);
    }

    private processReturnStatement(node: ts.ReturnStatement): void {
        if (node.expression) {
            this.processExpression(node.expression);

            const resultInfo = this.functionContext.stack.pop();
            this.functionContext.code.push(
                [Ops.RETURN, resultInfo.getRegister(), 2]);
        } else {
            this.functionContext.code.push([Ops.RETURN, 0, 1]);
        }
    }

    private processIfStatement(node: ts.IfStatement): void {
        this.processExpression(node.expression);

        const equalsTo = 0;
        const ifExptNode = this.functionContext.stack.pop().optimize();

        const testSetOp = [Ops.TEST, ifExptNode.getRegisterOrIndex(), equalsTo];
        this.functionContext.code.push(testSetOp);

        const jmpOp = [Ops.JMP, 0, 1];
        this.functionContext.code.push(jmpOp);

        const beforeBlock = this.functionContext.code.length;

        this.processStatement(node.thenStatement);

        let jmpElseOp;
        let elseBlock;
        if (node.elseStatement) {
            jmpElseOp = [Ops.JMP, 0, 1];
            this.functionContext.code.push(jmpElseOp);

            elseBlock = this.functionContext.code.length;
        }

        jmpOp[2] = this.functionContext.code.length - beforeBlock;

        if (node.elseStatement) {
            this.processStatement(node.elseStatement);
            jmpElseOp[2] = this.functionContext.code.length - elseBlock;
        }
    }

    private processDoStatement(node: ts.DoStatement): void {
        this.emitLoop(node.expression, node);
    }

    private processWhileStatement(node: ts.WhileStatement): void {
        // jump to expression
        const jmpOp = [Ops.JMP, 0, 0];
        this.functionContext.code.push(jmpOp);

        const beforeBlock = this.functionContext.code.length;

        jmpOp[2] = this.emitLoop(node.expression, node) - beforeBlock;
    }

    private processForStatement(node: ts.ForStatement): void {

        this.functionContext.newLocalScope(node);

        this.declareLoopVariables(<ts.Expression>node.initializer);

        // jump to expression
        const jmpOp = [Ops.JMP, 0, 0];
        this.functionContext.code.push(jmpOp);

        const beforeBlock = this.functionContext.code.length;

        jmpOp[2] = this.emitLoop(node.condition, node, node.incrementor) - beforeBlock;

        this.functionContext.restoreLocalScope();
    }

    private declareLoopVariables(initializer: ts.Expression) {
        if (initializer) {
            if (initializer.kind === ts.SyntaxKind.Identifier) {
                this.processVariableDeclarationOne(initializer.getText(), undefined, true);
            } else {
                this.processExpression(<ts.Expression>initializer);
            }
        }
    }

    private emitLoop(expression: ts.Expression, node: ts.IterationStatement, incrementor?: ts.Expression): number {
        const beforeBlock = this.functionContext.code.length;

        this.processStatement(node.statement);

        this.resolveContinueJumps();

        if (incrementor) {
            this.processExpression(incrementor);
        }

        const expressionBlock = this.functionContext.code.length;

        if (expression) {
            this.processExpression(expression);

            const ifExptNode = this.functionContext.stack.pop().optimize();

            const equalsTo = 1;
            const testSetOp = [Ops.TEST, ifExptNode.getRegisterOrIndex(), 0 /*unused*/, equalsTo];
            this.functionContext.code.push(testSetOp);
        }

        const jmpOp = [Ops.JMP, 0, beforeBlock - this.functionContext.code.length - 1];
        this.functionContext.code.push(jmpOp);

        this.resolveBreakJumps();

        return expressionBlock;
    }

    private processForInStatement(node: ts.ForInStatement): void {

        this.functionContext.newLocalScope(node);

        // we need to generate 3 local variables for ForEach loop
        const generatorInfo = this.functionContext.createLocal('<generator>' + node.getStart());
        const stateInfo = this.functionContext.createLocal('<state>' + node.getStart());
        const controlInfo = this.functionContext.createLocal('<control>' + node.getStart());

        // initializer
        this.declareLoopVariables(<ts.Expression>node.initializer);

        // call PAIRS(...) before jump
        // TODO: finish it
        this.processExpression(node.expression);

        // prepare call for _ENV "pairs"
        // prepare consts
        const envInfo = this.resolver.returnResolvedEnv(this.functionContext);
        const pairsMethodInfo = this.resolver.returnConst('pairs', this.functionContext);

        const expressionResultInfo = this.functionContext.stack.peek();
        // getting method referene
        this.functionContext.code.push(
            [Ops.GETTABUP, generatorInfo.getRegister(), envInfo.getRegisterOrIndex(), pairsMethodInfo.getRegisterOrIndex()]);

        // first parameter of method call "pairs"
        if (expressionResultInfo.getRegisterOrIndex() < 0) {
            this.functionContext.code.push(
                [Ops.LOADK, stateInfo.getRegister(), expressionResultInfo.getRegisterOrIndex()]);
        } else {
            this.functionContext.code.push(
                [Ops.MOVE, stateInfo.getRegister(), expressionResultInfo.getRegisterOrIndex()]);
        }

        // finally - calling method 'pairs'
        this.functionContext.code.push(
            [Ops.CALL, generatorInfo.getRegister(), 2, 4]);

        // cleaning up stack, first parameter, method ref, and expression
        this.functionContext.stack.pop();

        // jump to expression
        const initialJmpOp = [Ops.JMP, 0, 0];
        this.functionContext.code.push(initialJmpOp);

        const beforeBlock = this.functionContext.code.length;

        this.processStatement(node.statement);

        const loopOpsBlock = this.functionContext.code.length;

        this.resolveContinueJumps();

        // !!!! TODO: problem in calling this code, something happening to NULL value
        const tforCallOp = [Ops.TFORCALL, generatorInfo.getRegister(), 0, 1];
        this.functionContext.code.push(tforCallOp);

        // replace with TFORLOOP
        const tforLoopOp = [Ops.TFORLOOP, controlInfo.getRegister(), beforeBlock - this.functionContext.code.length - 1];
        this.functionContext.code.push(tforLoopOp);

        // storing jump address
        initialJmpOp[2] = loopOpsBlock - beforeBlock;

        this.resolveBreakJumps();

        this.functionContext.restoreLocalScope();
    }

    private processBreakStatement(node: ts.BreakStatement) {
        const breakJmpOp = [Ops.JMP, 0, 0];
        this.functionContext.code.push(breakJmpOp);
        this.functionContext.breaks.push(this.functionContext.code.length - 1);
    }

    private resolveBreakJumps(jump?: number) {
        this.functionContext.breaks.forEach(b => {
            this.functionContext.code[b][2] = (jump ? jump : this.functionContext.code.length) - b - 1;
        });

        this.functionContext.breaks = [];
    }

    private processContinueStatement(node: ts.ContinueStatement) {
        const continueJmpOp = [Ops.JMP, 0, 0];
        this.functionContext.code.push(continueJmpOp);
        this.functionContext.continues.push(this.functionContext.code.length - 1);
    }

    private resolveContinueJumps(jump?: number) {
        this.functionContext.continues.forEach(c => {
            this.functionContext.code[c][2] = (jump ? jump : this.functionContext.code.length) - c - 1;
        });

        this.functionContext.continues = [];
    }

    private processBlock(node: ts.Block): void {

        this.functionContext.newLocalScope(node);

        node.statements.forEach(s => {
            this.processStatement(s);
        });

        this.functionContext.restoreLocalScope();
    }

    private processBooleanLiteral(node: ts.BooleanLiteral): void {
        const boolValue = node.kind === ts.SyntaxKind.TrueKeyword;
        const opCode = [Ops.LOADBOOL, this.functionContext.useRegisterAndPush().getRegister(), boolValue ? 1 : 0, 0];
        this.functionContext.code.push(opCode);
    }

    private processNullLiteral(node: ts.NullLiteral): void {
        const resultInfo = this.functionContext.useRegisterAndPush();
        // LOADNIL A B     R(A), R(A+1), ..., R(A+B) := nil
        this.functionContext.code.push([Ops.LOADNIL, resultInfo.getRegister(), 0]);
    }

    private processNumericLiteral(node: ts.NumericLiteral): void {
        this.emitNumericConst(node.text);
    }

    private emitNumericConst(text: string): void {
        const resultInfo = this.functionContext.useRegisterAndPush();
        const resolvedInfo = this.resolver.returnConst(
            text.indexOf('.') === -1 ? parseInt(text, 10) : parseFloat(text), this.functionContext);
        // LOADK A Bx    R(A) := Kst(Bx)
        this.functionContext.code.push([Ops.LOADK, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
    }

    private processStringLiteral(node: ts.StringLiteral): void {
        const resultInfo = this.functionContext.useRegisterAndPush();
        const resolvedInfo = this.resolver.returnConst(node.text, this.functionContext);
        // LOADK A Bx    R(A) := Kst(Bx)
        this.functionContext.code.push([Ops.LOADK, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
    }

    private processNoSubstitutionTemplateLiteral(node: ts.NoSubstitutionTemplateLiteral): void {
        this.processStringLiteral(<ts.StringLiteral><any>node);
    }

    private processTemplateExpression(node: ts.TemplateExpression): void {
        this.transpileTSNode(node);
    }

    private processObjectLiteralExpression(node: ts.ObjectLiteralExpression): void {
        const resultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([
            Ops.NEWTABLE,
            resultInfo.getRegister(),
            node.properties.length,
            0]);

        this.resolver.Scope.push(node);

        if (node.properties.length > 0) {
            node.properties.forEach((e: ts.PropertyAssignment, index: number) => {
                // set 0 element
                this.processExpression(<ts.Expression><any>e.name);
                this.processExpression(e.initializer);

                const propertyValueInfo = this.functionContext.stack.pop().optimize();
                const propertyIndexInfo = this.functionContext.stack.pop().optimize();

                this.functionContext.code.push(
                    [Ops.SETTABLE,
                    resultInfo.getRegister(),
                    propertyIndexInfo.getRegisterOrIndex(),
                    propertyValueInfo.getRegisterOrIndex()]);
            });
        }

        this.resolver.Scope.pop();
    }

    private processArrayLiteralExpression(node: ts.ArrayLiteralExpression): void {
        const resultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([
            Ops.NEWTABLE,
            resultInfo.getRegister(),
            node.elements.length,
            0]);

        if (node.elements.length > 0) {
            // set 0 element
            this.processExpression(<ts.NumericLiteral>{ kind: ts.SyntaxKind.NumericLiteral, text: '0' });
            this.processExpression(node.elements[0]);

            const zeroValueInfo = this.functionContext.stack.pop().optimize();
            const zeroIndexInfo = this.functionContext.stack.pop().optimize();

            this.functionContext.code.push(
                [Ops.SETTABLE,
                resultInfo.getRegister(),
                zeroIndexInfo.getRegisterOrIndex(),
                zeroValueInfo.getRegisterOrIndex()]);

            // set 1.. elements
            const reversedValues = (<Array<any>><any>node.elements.slice(1));

            reversedValues.forEach((e, index: number) => {
                this.processExpression(e);
            });

            reversedValues.forEach(a => {
                // pop method arguments
                this.functionContext.stack.pop();
            });

            if (node.elements.length > 511) {
                throw new Error('finish using C in SETLIST');
            }

            this.functionContext.code.push(
                [Ops.SETLIST, resultInfo.getRegister(), reversedValues.length, 1]);
        }
    }

    private processElementAccessExpression(node: ts.ElementAccessExpression): void {
        this.processExpression(node.expression);
        this.processExpression(node.argumentExpression);

        // perform load
        const indexInfo = this.functionContext.stack.pop().optimize();
        const variableInfo = this.functionContext.stack.pop().optimize();

        const resultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push(
            [Ops.GETTABLE,
            resultInfo.getRegister(),
            variableInfo.getRegisterOrIndex(),
            indexInfo.getRegisterOrIndex()]);
    }

    private processParenthesizedExpression(node: ts.ParenthesizedExpression) {
        this.processExpression(node.expression);
    }

    private processPrefixUnaryExpression(node: ts.PrefixUnaryExpression): void {

        // TODO: this code can be improved by ataching Ops codes to ResolvedInfo instead of guessing where the beginning of the command
        const operandPosition = this.functionContext.code.length;

        this.processExpression(node.operand);

        let opCode;
        switch (node.operator) {
            case ts.SyntaxKind.MinusToken:
            case ts.SyntaxKind.TildeToken:
            case ts.SyntaxKind.ExclamationToken:
                switch (node.operator) {
                    case ts.SyntaxKind.MinusToken:
                        opCode = Ops.UNM;
                        break;
                    case ts.SyntaxKind.TildeToken:
                        opCode = Ops.BNOT;
                        break;
                    case ts.SyntaxKind.ExclamationToken:
                        opCode = Ops.NOT;
                        break;
                }

                // no optimization required as expecting only Registers
                const rightNode = this.functionContext.stack.pop();
                const resultInfo = this.functionContext.useRegisterAndPush();

                this.functionContext.code.push([
                    opCode,
                    resultInfo.getRegister(),
                    rightNode.getRegisterOrIndex()]);
                break;

            case ts.SyntaxKind.PlusPlusToken:
            case ts.SyntaxKind.MinusMinusToken:
                switch (node.operator) {
                    case ts.SyntaxKind.PlusPlusToken:
                        opCode = Ops.ADD;
                        break;
                    case ts.SyntaxKind.MinusMinusToken:
                        opCode = Ops.SUB;
                        break;
                }

                this.emitNumericConst('1');

                // +/- 1
                const value1Info = this.functionContext.stack.pop().optimize();
                const operandInfo = this.functionContext.stack.pop().optimize();
                const resultPlusOrMinusInfo = this.functionContext.useRegisterAndPush();

                this.functionContext.code.push([
                    opCode,
                    resultPlusOrMinusInfo.getRegister(),
                    operandInfo.getRegister(),
                    value1Info.getRegisterOrIndex()]);

                // save
                const operationResultInfo = this.functionContext.stack.pop();
                const readOpCode = this.functionContext.code[operandPosition];
                if (readOpCode && readOpCode[0] === Ops.GETTABUP) {
                    this.functionContext.code.push([
                        Ops.SETTABUP,
                        readOpCode[2],
                        readOpCode[3],
                        operandInfo.getRegister()
                    ]);
                } else if (readOpCode && readOpCode[0] === Ops.GETTABLE) {
                    this.functionContext.code.push([
                        Ops.SETTABLE,
                        readOpCode[2],
                        readOpCode[3],
                        operandInfo.getRegister()
                    ]);
                } else if (operandInfo.kind === ResolvedKind.Register) {
                    this.functionContext.code.push([
                        Ops.MOVE,
                        operandInfo.getRegister(),
                        operationResultInfo.getRegister()]);
                }

                // clone value
                this.functionContext.stack.push(operationResultInfo);

                break;
        }
    }

    private processPostfixUnaryExpression(node: ts.PostfixUnaryExpression): void {
        // TODO: this code can be improved by ataching Ops codes to ResolvedInfo instead of guessing where the beginning of the command
        const operandPosition = this.functionContext.code.length;

        this.processExpression(node.operand);

        let opCode;
        switch (node.operator) {
            case ts.SyntaxKind.PlusPlusToken:
            case ts.SyntaxKind.MinusMinusToken:
                switch (node.operator) {
                    case ts.SyntaxKind.PlusPlusToken:
                        opCode = Ops.ADD;
                        break;
                    case ts.SyntaxKind.MinusMinusToken:
                        opCode = Ops.SUB;
                        break;
                }

                // clone
                const operandInfo = this.functionContext.stack.peek();

                this.emitNumericConst('1');
                const value1Info = this.functionContext.stack.pop().optimize();

                // +/- 1
                const resultPlusOrMinuesInfo = this.functionContext.useRegisterAndPush();
                this.functionContext.code.push([
                    opCode,
                    resultPlusOrMinuesInfo.getRegister(),
                    operandInfo.getRegister(),
                    value1Info.getRegisterOrIndex()]);

                // consumed operand. we need to pop here to maintain order of used registers
                this.functionContext.stack.pop();

                // save
                const readOpCode = this.functionContext.code[operandPosition];
                if (readOpCode && readOpCode[0] === Ops.GETTABUP) {
                    this.functionContext.code.push([
                        Ops.SETTABUP,
                        readOpCode[2],
                        readOpCode[3],
                        resultPlusOrMinuesInfo.getRegister()
                    ]);
                } else if (readOpCode && readOpCode[0] === Ops.GETTABLE) {
                    this.functionContext.code.push([
                        Ops.SETTABLE,
                        readOpCode[2],
                        readOpCode[3],
                        resultPlusOrMinuesInfo.getRegister()
                    ]);
                } else if (readOpCode && readOpCode[0] === Ops.MOVE) {
                    this.functionContext.code.push([
                        Ops.MOVE,
                        readOpCode[2],
                        resultPlusOrMinuesInfo.getRegister()]);
                }

                break;
        }
    }

    private processConditionalExpression(node: ts.ConditionalExpression): void {
        this.processExpression(node.condition);

        const equalsTo = 0;
        const conditionInfo = this.functionContext.stack.pop().optimize();
        const resultInfo = this.functionContext.useRegisterAndPush();

        const testSetOp = [Ops.TEST, conditionInfo.getRegisterOrIndex(), equalsTo];
        this.functionContext.code.push(testSetOp);

        const jmpOp = [Ops.JMP, 0, 1];
        this.functionContext.code.push(jmpOp);

        const beforeBlock = this.functionContext.code.length;

        this.processExpression(node.whenTrue);
        const whenTrueInfo = this.functionContext.stack.pop().optimize();

        if (whenTrueInfo.getRegisterOrIndex() < 0) {
            this.functionContext.code.push([
                Ops.LOADK,
                resultInfo.getRegister(),
                whenTrueInfo.getRegisterOrIndex(),
                0]);
        } else {
            this.functionContext.code.push([
                Ops.MOVE,
                resultInfo.getRegister(),
                whenTrueInfo.getRegister(),
                0]);
        }

        const jmpElseOp = [Ops.JMP, 0, 1];
        this.functionContext.code.push(jmpElseOp);

        const elseBlock = this.functionContext.code.length;

        jmpOp[2] = this.functionContext.code.length - beforeBlock;

        this.processExpression(node.whenFalse);
        const whenFalseInfo = this.functionContext.stack.pop().optimize();

        if (whenFalseInfo.getRegisterOrIndex() < 0) {
            this.functionContext.code.push([
                Ops.LOADK,
                resultInfo.getRegister(),
                whenFalseInfo.getRegisterOrIndex(),
                0]);
        } else {
            this.functionContext.code.push([
                Ops.MOVE,
                resultInfo.getRegister(),
                whenFalseInfo.getRegister(),
                0]);
        }

        jmpElseOp[2] = this.functionContext.code.length - elseBlock;
    }

    private processBinaryExpression(node: ts.BinaryExpression): void {
        // perform '='
        switch (node.operatorToken.kind) {
            case ts.SyntaxKind.EqualsToken:

                // ... = <right>
                this.processExpression(node.right);

                // <left> = ...
                this.processExpression(node.left);

                this.emitAssignOperation(node);

                break;

            case ts.SyntaxKind.PlusToken:
            case ts.SyntaxKind.MinusToken:
            case ts.SyntaxKind.AsteriskToken:
            case ts.SyntaxKind.AsteriskAsteriskToken:
            case ts.SyntaxKind.PercentToken:
            case ts.SyntaxKind.CaretToken:
            case ts.SyntaxKind.SlashToken:
            case ts.SyntaxKind.AmpersandToken:
            case ts.SyntaxKind.BarToken:
            case ts.SyntaxKind.CaretToken:
            case ts.SyntaxKind.LessThanLessThanToken:
            case ts.SyntaxKind.GreaterThanGreaterThanToken:
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:

            case ts.SyntaxKind.PlusEqualsToken:
            case ts.SyntaxKind.MinusEqualsToken:
            case ts.SyntaxKind.AsteriskEqualsToken:
            case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
            case ts.SyntaxKind.PercentEqualsToken:
            case ts.SyntaxKind.CaretEqualsToken:
            case ts.SyntaxKind.SlashEqualsToken:
            case ts.SyntaxKind.AmpersandEqualsToken:
            case ts.SyntaxKind.BarEqualsToken:
            case ts.SyntaxKind.CaretEqualsToken:
            case ts.SyntaxKind.LessThanLessThanEqualsToken:
            case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:

                let leftOpNode;
                let rightOpNode;

                let operationCode = this.opsMap[node.operatorToken.kind];
                if (node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
                    const typeResult = this.resolver.getTypeAtLocation(node);
                    if (typeResult && typeResult.intrinsicName === 'string') {
                        operationCode = Ops.CONCAT;
                    }
                }

                // <left> + ...
                this.processExpression(node.left);

                // ... + <right>
                this.processExpression(node.right);


                if (operationCode === Ops.CONCAT) {
                    rightOpNode = this.functionContext.stack.pop();
                    leftOpNode = this.functionContext.stack.pop();
                } else {
                    rightOpNode = this.functionContext.stack.pop().optimize();
                    leftOpNode = this.functionContext.stack.pop().optimize();
                }

                const resultInfo = this.functionContext.useRegisterAndPush();

                this.functionContext.code.push([
                    operationCode,
                    resultInfo.getRegister(),
                    leftOpNode.getRegisterOrIndex(),
                    rightOpNode.getRegisterOrIndex()]);

                // we need to store result at the end of operation
                switch (node.operatorToken.kind) {
                    case ts.SyntaxKind.PlusEqualsToken:
                    case ts.SyntaxKind.MinusEqualsToken:
                    case ts.SyntaxKind.AsteriskEqualsToken:
                    case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
                    case ts.SyntaxKind.PercentEqualsToken:
                    case ts.SyntaxKind.CaretEqualsToken:
                    case ts.SyntaxKind.SlashEqualsToken:
                    case ts.SyntaxKind.AmpersandEqualsToken:
                    case ts.SyntaxKind.BarEqualsToken:
                    case ts.SyntaxKind.CaretEqualsToken:
                    case ts.SyntaxKind.LessThanLessThanEqualsToken:
                    case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
                    case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:

                        // <left> = ...
                        this.processExpression(node.left);

                        this.emitAssignOperation(node);
                        break;
                }

                break;

            case ts.SyntaxKind.EqualsEqualsToken:
            case ts.SyntaxKind.EqualsEqualsEqualsToken:
            case ts.SyntaxKind.LessThanToken:
            case ts.SyntaxKind.LessThanEqualsToken:
            case ts.SyntaxKind.ExclamationEqualsToken:
            case ts.SyntaxKind.ExclamationEqualsEqualsToken:
            case ts.SyntaxKind.GreaterThanToken:
            case ts.SyntaxKind.GreaterThanEqualsToken:

                // ... = <right>
                this.processExpression(node.right);

                // <left> = ...
                this.processExpression(node.left);

                const leftOpNode2 = this.functionContext.stack.pop().optimize();
                const rightOpNode2 = this.functionContext.stack.pop().optimize();
                const resultInfo2 = this.functionContext.useRegisterAndPush();

                let equalsTo = 1;
                switch (node.operatorToken.kind) {
                    case ts.SyntaxKind.ExclamationEqualsToken:
                    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                    case ts.SyntaxKind.GreaterThanToken:
                    case ts.SyntaxKind.GreaterThanEqualsToken:
                        equalsTo = 0;
                        break;
                }

                this.functionContext.code.push([
                    this.opsMap[node.operatorToken.kind],
                    equalsTo,
                    leftOpNode2.getRegisterOrIndex(),
                    rightOpNode2.getRegisterOrIndex()]);

                // in case of logical ops finish it
                const trueValue = 1;
                const falseValue = 0;

                this.functionContext.code.push([
                    Ops.JMP,
                    0,
                    1]);

                this.functionContext.code.push([
                    Ops.LOADBOOL,
                    resultInfo2.getRegister(),
                    falseValue,
                    1]);

                this.functionContext.code.push([
                    Ops.LOADBOOL,
                    resultInfo2.getRegister(),
                    trueValue,
                    0]);

                break;

            case ts.SyntaxKind.AmpersandAmpersandToken:
            case ts.SyntaxKind.BarBarToken:

                // <left> = ...
                this.processExpression(node.left);

                const leftOpNode3 = this.functionContext.stack.pop().optimize();

                let equalsTo2 = 0;
                switch (node.operatorToken.kind) {
                    case ts.SyntaxKind.BarBarToken:
                        equalsTo2 = 1;
                        break;
                }

                const testSetOp = [
                    Ops.TESTSET,
                    undefined,
                    leftOpNode3.getRegisterOrIndex(),
                    equalsTo2];
                this.functionContext.code.push(testSetOp);

                const jmpOp = [
                    Ops.JMP,
                    0,
                    1];
                this.functionContext.code.push(jmpOp);
                const beforeBlock = this.functionContext.code.length;

                // ... = <right>
                this.processExpression(node.right);

                const rightOpNode3 = this.functionContext.stack.pop().optimize();
                const resultInfo3 = this.functionContext.useRegisterAndPush();
                testSetOp[1] = resultInfo3.getRegister();

                if (rightOpNode3.getRegisterOrIndex() < 0) {
                    this.functionContext.code.push([
                        Ops.LOADK,
                        resultInfo3.getRegister(),
                        rightOpNode3.getRegisterOrIndex(),
                        0]);
                } else {
                    this.functionContext.code.push([
                        Ops.MOVE,
                        resultInfo3.getRegister(),
                        rightOpNode3.getRegister(),
                        0]);
                }

                jmpOp[2] = this.functionContext.code.length - beforeBlock;

                break;

            default: throw new Error('Not Implemented');
        }
    }

    private emitAssignOperation(node: ts.Node) {
        const leftOperandInfo = this.functionContext.stack.pop();
        const rightOperandInfo = this.functionContext.stack.pop();
        const readOpCode = this.functionContext.code[this.functionContext.code.length - 1];

        if (leftOperandInfo.kind === ResolvedKind.Register) {
            if (readOpCode[0] === Ops.GETTABUP) {
                if (node.parent && node.parent.kind !== ts.SyntaxKind.ExpressionStatement) {
                    // we need to store register in stack to reuse it in next expression
                    this.functionContext.stack.push(rightOperandInfo);
                }
                // left of = is method reference
                const getTabUpOpArray = this.functionContext.code.pop();
                rightOperandInfo.optimize();
                this.functionContext.code.push([
                    Ops.SETTABUP,
                    getTabUpOpArray[2],
                    getTabUpOpArray[3],
                    rightOperandInfo.getRegisterOrIndex()
                ]);
            } else if (readOpCode[0] === Ops.GETTABLE) {
                if (node.parent && node.parent.kind !== ts.SyntaxKind.ExpressionStatement) {
                    // we need to store register in stack to reuse it in next expression
                    this.functionContext.stack.push(rightOperandInfo);
                }
                // left of = is method reference
                const getTableOpArray = this.functionContext.code.pop();
                rightOperandInfo.optimize();
                this.functionContext.code.push([
                    Ops.SETTABLE,
                    getTableOpArray[2],
                    getTableOpArray[3],
                    rightOperandInfo.getRegisterOrIndex()
                ]);
            } else if (readOpCode[0] === Ops.MOVE) {
                if (node.parent && node.parent.kind !== ts.SyntaxKind.ExpressionStatement) {
                    // we need to store register in stack to reuse it in next expression
                    this.functionContext.stack.push(leftOperandInfo);
                }
                // if we put local var value we need to remove it
                const readMoveOpArray = this.functionContext.code.pop();
                leftOperandInfo.register = readMoveOpArray[2];
                this.functionContext.code.push([Ops.MOVE, leftOperandInfo.getRegister(), rightOperandInfo.getRegister()]);
            } else {
                if (node.parent && node.parent.kind !== ts.SyntaxKind.ExpressionStatement) {
                    // we need to store register in stack to reuse it in next expression
                    this.functionContext.stack.push(leftOperandInfo);
                }
                this.functionContext.code.push([Ops.MOVE, leftOperandInfo.getRegister(), rightOperandInfo.getRegister()]);
            }
        } else if (leftOperandInfo.kind === ResolvedKind.Upvalue) {
            this.functionContext.code.push([
                Ops.SETUPVAL,
                rightOperandInfo.getRegister(),
                leftOperandInfo.getRegisterOrIndex()
            ]);
        } else {
            throw new Error('Not Implemented');
        }
    }

    private processDeleteExpression(node: ts.DeleteExpression): void {
        // ... = <right>
        this.processNullLiteral(<ts.NullLiteral><any>node);

        // <left> = ...
        this.processExpression(node.expression);

        this.emitAssignOperation(node);
    }

    private processNewExpression(node: ts.NewExpression): void {
        const resultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([
            Ops.NEWTABLE,
            resultInfo.getRegister(),
            0,
            0]);

        this.processCallExpression(<ts.CallExpression><any>node, resultInfo);
    }

    private processCallExpression(node: ts.CallExpression, _thisForNew?: ResolvedInfo): void {

        this.resolver.methodCall = true;
        this.processExpression(node.expression);
        this.resolver.methodCall = false;

        if (_thisForNew) {
            const resultInfo = this.functionContext.useRegisterAndPush();
            this.functionContext.code.push([Ops.MOVE, resultInfo.getRegister(), _thisForNew.getRegister()]);
        }

        node.arguments.forEach(a => {
            // pop method arguments
            this.processExpression(a);
        });

        node.arguments.forEach(a => {
            this.functionContext.stack.pop();
        });

        if (_thisForNew) {
            this.functionContext.stack.pop();
        }

        const methodResolvedInfo = this.functionContext.stack.pop();

        // TODO: temporary solution: if method called in Statement then it is not returning value
        const isStatementCall = node.parent.kind === ts.SyntaxKind.ExpressionStatement || _thisForNew;
        const isMethodArgumentCall = node.parent.kind === ts.SyntaxKind.CallExpression;
        const returnCount = isStatementCall ? 1 : isMethodArgumentCall ? 0 : 2;

        if (returnCount !== 1) {
            this.functionContext.useRegisterAndPush();
        }

        this.functionContext.code.push(
            [Ops.CALL, methodResolvedInfo.getRegister(), node.arguments.length + 1 + (_thisForNew ? 1 : 0), returnCount]);
    }

    private processThisExpression(node: ts.ThisExpression): void {
        this.functionContext.stack.push(this.resolver.returnThis(this.functionContext));
    }

    private processIndentifier(node: ts.Identifier): void {
        const resolvedInfo = this.resolver.resolver(<ts.Identifier>node, this.functionContext);
        if (resolvedInfo.kind === ResolvedKind.Register) {
            const resultInfo = this.functionContext.useRegisterAndPush();
            this.functionContext.code.push([Ops.MOVE, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
            return;
        }

        if (resolvedInfo.kind === ResolvedKind.LoadMember) {
            const resultInfo = this.functionContext.useRegisterAndPush();
            const objectIdentifierInfo = resolvedInfo.parentInfo;
            const memberIdentifierInfo = resolvedInfo.currentInfo;

            this.functionContext.code.push(
                [Ops.GETTABUP,
                resultInfo.getRegister(),
                objectIdentifierInfo.getRegisterOrIndex(),
                memberIdentifierInfo.getRegisterOrIndex()]);
            return;
        }

        if (resolvedInfo.kind === ResolvedKind.Upvalue
            || resolvedInfo.kind === ResolvedKind.Const) {
            this.functionContext.stack.push(resolvedInfo);
            return;
        }

        throw new Error('Not Implemeneted');
    }

    private processPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        this.processExpression(node.expression);

        this.resolver.Scope.push(this.functionContext.stack.peek());
        this.processExpression(node.name);
        this.resolver.Scope.pop();

        // perform load
        const memberIdentifierInfo = this.functionContext.stack.pop().optimize();
        const objectIdentifierInfo = this.functionContext.stack.pop().optimize();

        let opCode = objectIdentifierInfo.kind === ResolvedKind.Upvalue ? Ops.GETTABUP : Ops.GETTABLE;
        if (this.resolver.methodCall && objectIdentifierInfo.kind === ResolvedKind.Register) {
            opCode = Ops.SELF;
        }

        const resultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push(
            [opCode,
                resultInfo.getRegister(),
                objectIdentifierInfo.getRegisterOrIndex(),
                memberIdentifierInfo.getRegisterOrIndex()]);
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
        this.emitUpvalues(functionContext);
        this.emitProtos(functionContext);
        this.emitDebug(functionContext);
    }

    private emitFunctionHeader(functionContext: FunctionContext): void {
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
            const opCodeMode: OpMode = OpCodes[c[0]];
            const encoded = opCodeMode.encode(c);
            this.writer.writeInt(encoded);
        });
    }

    private emitConstants(functionContext: FunctionContext): void {
        this.writer.writeInt(functionContext.contants.length);

        functionContext.contants.forEach(c => {

            if (c !== null) {
                // create 4 bytes value
                switch (typeof c) {
                    case 'boolean':
                        this.writer.writeByte(LuaTypes.LUA_TBOOLEAN);
                        this.writer.writeByte(c);
                        break;
                    case 'number':
                        if (Number.isInteger(c)) {
                            this.writer.writeByte(LuaTypes.LUA_TNUMINT);
                            this.writer.writeInteger(c);
                        } else {
                            this.writer.writeByte(LuaTypes.LUA_TNUMBER);
                            this.writer.writeNumber(c);
                        }
                        break;
                    case 'string':
                        if ((<string>c).length > 255) {
                            this.writer.writeByte(LuaTypes.LUA_TLNGSTR);
                        } else {
                            this.writer.writeByte(LuaTypes.LUA_TSTRING);
                        }

                        this.writer.writeString(c);
                        break;
                    default: throw new Error('Method not implemeneted');
                }
            } else {
                this.writer.writeByte(LuaTypes.LUA_TNIL);
            }
        });
    }

    private emitUpvalues(functionContext: FunctionContext): void {
        this.writer.writeInt(functionContext.upvalues.length);

        functionContext.upvalues.forEach((upvalue: UpvalueInfo, index: number) => {
            // in stack (bool)
            this.writer.writeByte((upvalue.instack) ? 1 : 0);
            // index
            this.writer.writeByte(upvalue.index || index);
        });
    }

    private emitProtos(functionContext: FunctionContext): void {
        this.writer.writeInt(functionContext.protos.length);

        functionContext.protos.forEach(p => {
            // TODO: finish it
            this.emitFunction(p);
        });
    }

    private emitDebug(functionContext: FunctionContext): void {

        if (functionContext.debug.length === 0) {
            this.writer.writeInt(0);
            this.writer.writeInt(0);
            this.writer.writeInt(0);
        } else {
            throw new Error('Method not implemeneted');
        }
    }
}
