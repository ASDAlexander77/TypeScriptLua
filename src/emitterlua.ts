import * as ts from 'typescript';
import { TextWriter } from './textwriter';
import { FunctionContext, UpvalueInfo } from './contexts';
import { IdentifierResolver, ResolvedInfo, ResolvedKind } from './resolvers';
import { Ops, OpMode, OpCodes, LuaTypes } from './opcodes';
import { Helpers } from './helpers';
import { Preprocessor } from './preprocessor';
import { TypeInfo } from './typeInfo';

export class EmitterLua {
    public writer: TextWriter = new TextWriter();
    public fileModuleName: string;
    private functionContextStack: Array<FunctionContext> = [];
    private functionContext: FunctionContext;
    private resolver: IdentifierResolver;
    private preprocessor: Preprocessor;
    private typeInfo: TypeInfo;
    private sourceFileName: string;
    private opsMap = [];
    private extraDebugEmbed = false;
    private generateSourceMap = false;
    private allowConstBigger255 = false;
    // can be used for testing to load const separately
    private splitConstFromOpCode = false;
    private jsLib: boolean;
    private varAsLet: boolean;
    private ignoreExtraLogic: boolean;

    public constructor(
        typeChecker: ts.TypeChecker, private options: ts.CompilerOptions,
        private cmdLineOptions: any, private singleModule: boolean, private rootFolder?: string) {

        this.varAsLet = cmdLineOptions.varAsLet;

        this.resolver = new IdentifierResolver(typeChecker, this.varAsLet);
        this.typeInfo = new TypeInfo(this.resolver);
        this.preprocessor = new Preprocessor(this.resolver, this.typeInfo);
        this.functionContext = new FunctionContext();

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

        this.extraDebugEmbed = cmdLineOptions.extradebug ? true : false;
        if (options && options.outFile && singleModule) {
            this.fileModuleName = options.outFile;
        }

        this.generateSourceMap = ((options && options.sourceMap) || false);

        this.jsLib = (
            options
            && options.lib
            && options.lib.some(l => /lib.es\d+.d.ts/.test(l))
            && !options.lib.some(l => /lib.es5.d.ts/.test(l))
            || cmdLineOptions.jslib)
            ? true
            : false;
    }

    private libCommon = '                                           \
    __type = __type || type;                                        \
                                                                    \
    __is_true = __is_true || function(inst:object) {                \
        if (inst == false || inst == null || inst == 0 || inst == undefined) {   \
            return false;                                           \
        }                                                           \
                                                                    \
        return true;                                                \
    };                                                              \
                                                                    \
    __cond = __cond || function(cond:boolean, trueValue:object, falseValue:object) { \
        if (__is_true(cond)) {                                      \
            return trueValue;                                       \
        }                                                           \
                                                                    \
        return falseValue;                                          \
    };                                                              \
                                                                    \
    __assign = __assign || function(left:object, right:object) {    \
        left = right;                                               \
        return right;                                               \
    };                                                              \
                                                                    \
    ___type = ___type || function(inst:object) {                    \
        const tp = __type(inst);                                    \
        return tp === "table" ? "object" : tp;                      \
    };                                                              \
                                                                    \
    __instanceof = __instanceof || function(inst:object, type:object) { \
        if (inst === null) {                                        \
            return false;                                           \
        }                                                           \
                                                                    \
        let mt:object;                                              \
        switch (__type(inst)) {                                     \
            case "table":                                           \
                mt = rawget(inst, "__proto");                       \
                break;                                              \
            case "number":                                          \
                mt = Number;                                        \
                break;                                              \
            case "string":                                          \
                mt = String;                                        \
                break;                                              \
            case "boolean":                                         \
                mt = Boolean;                                       \
                break;                                              \
        }                                                           \
                                                                    \
        while (mt !== null) {                                       \
            if (mt === type) {                                      \
                return true;                                        \
            }                                                       \
                                                                    \
            mt = rawget(mt, "__proto");                             \
        }                                                           \
                                                                    \
        return false;                                               \
    };                                                              \
                                                                    \
    __tostring = __tostring || function (v) {                       \
        if (v === null || v === undefined) {                        \
            return v;                                               \
        }                                                           \
                                                                    \
        return tostring(v);                                         \
    }                                                               \
                                                                    \
    __get_call_undefined__ = __get_call_undefined__ || function (t, k) { \
        let get_: object = rawget(t, "__get__");                    \
        let getmethod: object = get_ && rawget(get_, k);            \
        if (getmethod !== null) {                                   \
            return getmethod(t);                                    \
        }                                                           \
                                                                    \
        let proto: object = rawget(t, "__proto");                   \
                                                                    \
        while (proto !== null) {                                    \
            let v = rawget(proto, k);                               \
            if (v === null) {                                       \
                const nullsHolder: object = rawget(t, "__nulls");   \
                if (nullsHolder && rawget(nullsHolder, k)) {        \
                    return null;                                    \
                }                                                   \
            } else {                                                \
                return v;                                           \
            }                                                       \
                                                                    \
            get_ = rawget(proto, "__get__");                        \
            getmethod = get_ && rawget(get_, k);                    \
            if (getmethod !== null) {                               \
                return getmethod(t);                                \
            }                                                       \
                                                                    \
            proto = rawget(proto, "__proto");                       \
        }                                                           \
                                                                    \
        return undefined;                                           \
    };                                                              \
                                                                    \
    __set_call_undefined__ = __set_call_undefined__ || function (t, k, v) { \
        let proto: object = t;                                      \
        while (proto !== null) {                                    \
            let set_: object = rawget(proto, "__set__");            \
            const setmethod: object = set_ && rawget(set_, k);      \
            if (setmethod !== null) {                               \
                setmethod(t, v);                                    \
                return;                                             \
            }                                                       \
                                                                    \
            proto = rawget(proto, "__proto");                       \
        }                                                           \
                                                                    \
        if (v === null) {                                           \
            const nullsHolder: object = rawget(t, "__nulls");       \
            if (nullsHolder === null) {                             \
                nullsHolder = {};                                   \
                rawset(t, "__nulls", nullsHolder);                  \
            }                                                       \
                                                                    \
            rawset(nullsHolder, k, true);                           \
            return;                                                 \
        }                                                           \
                                                                    \
        let v0 = v;                                                 \
        if (v === undefined) {                                      \
            const nullsHolder: object = rawget(t, "__nulls");       \
            if (nullsHolder !== null) {                             \
                rawset(nullsHolder, k, null);                       \
            }                                                       \
                                                                    \
            v0 = null;                                              \
        }                                                           \
                                                                    \
        rawset(t, k, v0);                                           \
    };                                                              \
                                                                    \
    __wrapper = __wrapper || function(method: object, _this: object) { \
        if (!method || typeof(method) !== "function") {             \
            return method;                                          \
        }                                                           \
                                                                    \
        return function (...params: any[]) {                        \
            return method(_this, ...params);                        \
        };                                                          \
    };                                                              \
                                                                    \
    __bind = __bind || function(method: object, _this: object, ...prependParams: any[]) { \
        if (!method || typeof(method) !== "function") {             \
            return method;                                          \
        }                                                           \
                                                                    \
        if (prependParams && prependParams[0]) {                    \
            return function (...params: any[]) {                    \
                return method(_this, ...prependParams, ...params);  \
            };                                                      \
        }                                                           \
                                                                    \
        return function (...params: any[]) {                        \
            return prependParams && method(_this, ...params);       \
        };                                                          \
    };                                                              \
                                                                    \
    __call = __call || function(method: object, _this: object, ...params: any[]) { \
        if (!method || typeof(method) !== "function") {             \
            return _this.call(...params);                           \
        }                                                           \
                                                                    \
        if (params && params[0]) {                                  \
            return method(_this, ...params);                        \
        }                                                           \
                                                                    \
        return method(_this);                                       \
    };                                                              \
                                                                    \
    __apply = __apply || function(method: object, _this: object, params?: any[]): any { \
        if (!method || typeof(method) !== "function") {             \
            return _this.apply(_this, ...params);                   \
        }                                                           \
                                                                    \
        if (params && params[0]) {                                  \
            return method(_this, ...params);                        \
        }                                                           \
                                                                    \
        return method(_this);                                       \
    };                                                              \
                                                                    \
    __new = __new || function(proto: any, params?: any[]): any {    \
        if (!proto) {                                               \
            throw new Error("Prototype can\'t be undefined or null");\
        }                                                           \
                                                                    \
        const obj = <any>{                                          \
            __index: __get_call_undefined__,                        \
            __proto: proto,                                         \
            __newindex: __set_call_undefined__,                     \
        };                                                          \
        setmetatable(obj, obj);                                     \
                                                                    \
        if (obj.constructor) {                                      \
            obj.constructor(...params);                             \
        }                                                           \
                                                                    \
        return obj;                                                 \
    }                                                               \
                                                                    \
    __decorate = __decorate || function (                           \
        decors: any[], proto: any, propertyName: string, descriptorOrParameterIndex: any | undefined | null) \
    {                                                                                                   \
        const isClassDecorator = propertyName === undefined;                                            \
        const isMethodDecoratorOrParameterDecorator = descriptorOrParameterIndex !== undefined;         \
                                                                                                        \
        let protoOrDescriptorOrParameterIndex = isClassDecorator                                        \
            ? proto                                                                                     \
            : null === descriptorOrParameterIndex                                                       \
                ? descriptorOrParameterIndex = Object.getOwnPropertyDescriptor(proto, propertyName)     \
                : descriptorOrParameterIndex;                                                           \
                                                                                                        \
        for (let l = decors.length - 1; l >= 0; l--)                                                    \
        {                                                                                               \
            const decoratorItem = decors[l];                                                            \
            if (decoratorItem) {                                                                        \
                protoOrDescriptorOrParameterIndex =                                                     \
                    (isClassDecorator                                                                   \
                        ? decoratorItem(protoOrDescriptorOrParameterIndex)                              \
                        : isMethodDecoratorOrParameterDecorator                                         \
                            ? decoratorItem(proto, propertyName, protoOrDescriptorOrParameterIndex)     \
                            : decoratorItem(proto, propertyName))                                       \
                || protoOrDescriptorOrParameterIndex;                                                   \
            }                                                                                           \
        }                                                                                               \
                                                                                                        \
        if (isMethodDecoratorOrParameterDecorator && protoOrDescriptorOrParameterIndex)                 \
        {                                                                                               \
            Object.defineProperty(proto, propertyName, protoOrDescriptorOrParameterIndex);              \
        }                                                                                               \
                                                                                                        \
        return protoOrDescriptorOrParameterIndex;                                                       \
    };                                                                                                  \
    ';

    /*
    -- new instance
    local a = {}
    --a.__index = proto
    a.__index = __get_call__
    a.__proto = proto
    a.__newindex = __set_call__

    setmetatable(a, a)
    */

    public printNode(node: ts.Statement): string {
        const sourceFile = ts.createSourceFile(
            'noname', '', ts.ScriptTarget.ES2018, /*setParentNodes */ true, ts.ScriptKind.TS);

        (<any>sourceFile.statements) = [node];

        // debug output
        const emitter = ts.createPrinter({
            newLine: ts.NewLineKind.LineFeed,
        });

        const result = emitter.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
        return result;
    }

    public processNode(node: ts.Node): void {
        switch (node.kind) {
            case ts.SyntaxKind.SourceFile: this.processFile(<ts.SourceFile>node);
                break;
            case ts.SyntaxKind.Bundle: this.processBundle(<ts.Bundle>node);
                break;
            case ts.SyntaxKind.UnparsedSource: this.processUnparsedSource(<ts.UnparsedSource>node);
                break;
            default:
                // TODO: finish it
                throw new Error('Method not implemented.');
        }
    }

    public save() {
        // add final return
        if (!this.functionContext.isFinalReturnAdded) {
            this.functionContext.isFinalReturnAdded = true;
        }

        this.emitFunction(this.functionContext);
    }

    private pushFunctionContext(location: ts.Node) {
        const localFunctionContext = this.functionContext;
        this.functionContextStack.push(localFunctionContext);
        this.functionContext = new FunctionContext();
        this.functionContext.function_or_file_location_node = location;
        if (localFunctionContext) {
            this.functionContext.container = localFunctionContext;
            this.functionContext.current_location_node = localFunctionContext.current_location_node;
            this.functionContext.location_scopes = localFunctionContext.location_scopes;
        }
    }

    private popFunctionContext(): FunctionContext {
        const localFunctionContext = this.functionContext;
        this.functionContext = this.functionContextStack.pop();
        return localFunctionContext;
    }

    private processFunction(
        location: ts.Node,
        statements: ts.NodeArray<ts.Statement>,
        parameters: ts.NodeArray<ts.ParameterDeclaration>,
        createEnvironment?: boolean): FunctionContext {

        //this.pushFunctionContext(location);
        this.processFunctionWithinContext(location, statements, parameters, createEnvironment);
        //return this.popFunctionContext();
        return this.functionContext;
    }

    private hasMemberThis(location: ts.Node): boolean {
        if (!location) {
            return false;
        }

        if (location.parent && location.parent.kind !== ts.SyntaxKind.ClassDeclaration) {
            return false;
        }

        switch (location.kind) {
            case ts.SyntaxKind.Constructor:
                return true;
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.SetAccessor:
            case ts.SyntaxKind.GetAccessor:
                const isStatic = location.modifiers && location.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword);
                return !isStatic;
            case ts.SyntaxKind.PropertyDeclaration:
                return false;
        }

        return false;
    }

    private discoverModuleNode(location: ts.Node): string {
        let moduleName: string = null;
        function checkMoudleNode(node: ts.Node): any {
            if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
                moduleName = (<ts.ModuleDeclaration>node).name.text;
                return true;
            }

            ts.forEachChild(node, checkMoudleNode);
        }

        ts.forEachChild(location, checkMoudleNode);
        return moduleName;
    }

    private hasNodeUsedThis(location: ts.Node): boolean {
        let createThis = false;
        let root = true;
        function checkThisKeyward(node: ts.Node): any {
            if (root) {
                root = false;
            } else {
                if (node.kind === ts.SyntaxKind.FunctionDeclaration
                    || node.kind === ts.SyntaxKind.ArrowFunction
                    || node.kind === ts.SyntaxKind.MethodDeclaration
                    || node.kind === ts.SyntaxKind.FunctionExpression
                    || node.kind === ts.SyntaxKind.FunctionType
                    || node.kind === ts.SyntaxKind.ClassDeclaration
                    || node.kind === ts.SyntaxKind.ClassExpression) {
                    return;
                }
            }

            if (node.kind === ts.SyntaxKind.ThisKeyword) {
                createThis = true;
                return true;
            }

            ts.forEachChild(node, checkThisKeyward);
        }

        ts.forEachChild(location, checkThisKeyward);
        return createThis;
    }

    private hasNodeUsedVar(location: ts.Node): boolean {
        let hasVar = false;
        let root = true;
        function checkVar(node: ts.Node): any {
            if (root) {
                root = false;
            } else {
                if (node.kind === ts.SyntaxKind.FunctionDeclaration
                    || node.kind === ts.SyntaxKind.ArrowFunction
                    || node.kind === ts.SyntaxKind.MethodDeclaration
                    || node.kind === ts.SyntaxKind.FunctionExpression
                    || node.kind === ts.SyntaxKind.FunctionType
                    || node.kind === ts.SyntaxKind.ClassDeclaration
                    || node.kind === ts.SyntaxKind.ClassExpression) {
                    return;
                }
            }

            if (node.kind === ts.SyntaxKind.VariableDeclarationList) {
                hasVar = !Helpers.isConstOrLet(node);
                if (hasVar) {
                    return true;
                }
            }

            ts.forEachChild(node, checkVar);
        }

        ts.forEachChild(location, checkVar);
        return hasVar;
    }

    private hasContinue(location: ts.Node): boolean {
        let hasContinueStatement = false;
        let root = true;
        function checkContinue(node: ts.Node): any {
            if (root) {
                root = false;
            } else {
                if (node.kind === ts.SyntaxKind.FunctionDeclaration
                    || node.kind === ts.SyntaxKind.ArrowFunction
                    || node.kind === ts.SyntaxKind.MethodDeclaration
                    || node.kind === ts.SyntaxKind.FunctionExpression
                    || node.kind === ts.SyntaxKind.FunctionType
                    || node.kind === ts.SyntaxKind.ClassDeclaration
                    || node.kind === ts.SyntaxKind.ClassExpression) {
                    return;
                }
            }

            if (node.kind === ts.SyntaxKind.ContinueStatement) {
                hasContinueStatement = true;
                return true;
            }

            ts.forEachChild(node, checkContinue);
        }

        ts.forEachChild(location, checkContinue);
        return hasContinueStatement;
    }

    private getAllVar(location: ts.Node): string[] {
        const vars = <string[]>[];
        let root = true;
        function checkAllVar(node: ts.Node): any {
            if (root) {
                root = false;
            } else {
                if (node.kind === ts.SyntaxKind.FunctionDeclaration
                    || node.kind === ts.SyntaxKind.ArrowFunction
                    || node.kind === ts.SyntaxKind.MethodDeclaration
                    || node.kind === ts.SyntaxKind.FunctionExpression
                    || node.kind === ts.SyntaxKind.FunctionType
                    || node.kind === ts.SyntaxKind.ClassDeclaration
                    || node.kind === ts.SyntaxKind.ClassExpression) {
                    return;
                }
            }

            if (node.kind === ts.SyntaxKind.VariableDeclarationList) {
                if (!Helpers.isConstOrLet(node)) {
                    (<ts.VariableDeclarationList>node).declarations.forEach(
                        d => vars.push((<ts.Identifier>d.name).text));
                }
            }

            ts.forEachChild(node, checkAllVar);
        }

        ts.forEachChild(location, checkAllVar);
        return vars;
    }

    private getBodyByDecorators(statementsIn: ts.NodeArray<ts.Statement>, location: ts.Node): ts.NodeArray<ts.Statement> {
        const len = location.decorators
            && location.decorators.some(
                m => this.isInternalDecorator(m));

        if (len) {
            const firstParam = (<ts.MethodDeclaration>location).parameters[0];
            const operand = firstParam ? <ts.Identifier>firstParam.name : ts.createThis();
            const lengthMemeber = ts.createIdentifier('length');
            (<any>lengthMemeber).__len = true;

            const returnExpr =
                <ts.Statement>ts.createReturn(
                    ts.createBinary(
                        ts.createPropertyAccess(operand, lengthMemeber), ts.SyntaxKind.PlusToken, ts.createConditional(
                            ts.createElementAccess(operand, ts.createNumericLiteral('0')),
                            ts.createNumericLiteral('1'),
                            ts.createNumericLiteral('0'))));

            return <ts.NodeArray<ts.Statement>><any>[
                this.fixupParentReferences(returnExpr, location)
            ];
        }

        return statementsIn;
    }

    private isInternalDecorator(m: ts.Decorator): boolean {
        return m.expression.kind === ts.SyntaxKind.Identifier && (<ts.Identifier>m.expression).text === '__len__';
    }

    private processFunctionWithinContext(
        location: ts.Node,
        statementsIn: ts.NodeArray<ts.Statement>,
        parameters: ts.NodeArray<ts.ParameterDeclaration>,
        createEnvironment?: boolean,
        noReturn?: boolean) {

        const effectiveLocation = (<any>location).__origin ? (<any>location).__origin : location;
        const statements = this.getBodyByDecorators(statementsIn, effectiveLocation);
        let name = '';
        if (effectiveLocation.kind !== ts.SyntaxKind.SourceFile) {
            name = effectiveLocation.name ? effectiveLocation.name.text : '';
            this.functionContext.newFunctionScope(name);
        }

        this.functionContext.newLocalScope(effectiveLocation);

        this.functionContext.isStatic =
            effectiveLocation.modifiers && effectiveLocation.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword);

        const isClassDeclaration = this.functionContext.container
            && this.functionContext.container.current_location_node
            && this.functionContext.container.current_location_node.kind === ts.SyntaxKind.ClassDeclaration;

        this.functionContext.thisInUpvalue =
            location.kind === ts.SyntaxKind.ArrowFunction
            && !isClassDeclaration || location.kind === ts.SyntaxKind.TryStatement;

        const isMethod = location.kind === ts.SyntaxKind.FunctionDeclaration
            || location.kind === ts.SyntaxKind.FunctionExpression
            || location.kind === ts.SyntaxKind.ArrowFunction
            || location.kind === ts.SyntaxKind.MethodDeclaration
            || location.kind === ts.SyntaxKind.Constructor
            || location.kind === ts.SyntaxKind.SetAccessor
            || location.kind === ts.SyntaxKind.GetAccessor;

        const isAccessor = effectiveLocation.kind === ts.SyntaxKind.SetAccessor
            || effectiveLocation.kind === ts.SyntaxKind.GetAccessor;

        this.functionContext.has_var_declaration =
            location.kind !== ts.SyntaxKind.SourceFile
            && (this.hasNodeUsedVar(location) || this.hasAnyVarFunctionLevelScope());

        if (createEnvironment) {
            this.resolver.createEnv(this.functionContext);

            // we need to inject helper functions
            this.ignoreExtraLogic = true;
            this.processTSCode(this.libCommon, true);
            this.ignoreExtraLogic = false;
        }

        // add this to object
        let addThisAsParameter = !isAccessor &&
            ((location && location.parent && location.parent.kind === ts.SyntaxKind.PropertyAssignment)
                || (location && location.parent && location.parent.parent
                    && location.parent.parent.kind === ts.SyntaxKind.ObjectLiteralExpression));
        if (addThisAsParameter) {
            this.functionContext.createParam('this');
        }

        const origin = (<ts.Node>(<any>location).__origin);
        if (!addThisAsParameter
            && isMethod
            && (origin || !this.functionContext.thisInUpvalue)) {
            const createThis = (this.hasMemberThis(origin) || this.hasNodeUsedThis(location))
                && !(isClassDeclaration && this.functionContext.isStatic && !isAccessor);
            if (createThis) {
                const thisIsInParams = parameters && parameters.some(p => (<ts.Identifier>p.name).text === 'this');
                if (!thisIsInParams) {
                    this.functionContext.createParam('this');
                    addThisAsParameter = true;
                }
            }
        }

        if (parameters) {
            let dotDotDotAny = false;
            parameters.forEach(p => {
                const paramName = (<ts.Identifier>p.name).text;
                if (addThisAsParameter && paramName === 'this') {
                    return;
                }

                this.functionContext.createParam(paramName);
                if (p.dotDotDotToken) {
                    dotDotDotAny = true;
                }
            });

            this.functionContext.numparams = parameters.length + (addThisAsParameter ? 1 : 0) /*- (dotDotDotAny ? 1 : 0)*/;
            this.functionContext.is_vararg = dotDotDotAny;
        }

        // functino begin
        if (effectiveLocation.kind !== ts.SyntaxKind.SourceFile) {
            this.functionContext.textCode.push("function ");
            if (effectiveLocation.kind !== ts.SyntaxKind.MethodDeclaration)
            {
                this.functionContext.textCode.push(name);
            }

            this.functionContext.textCode.push("(");
            if (parameters.length > 0) {
                parameters.forEach(p => {
                    if (p.name.kind === ts.SyntaxKind.Identifier) {
                        this.functionContext.textCode.push(p.name.text);
                    }

                    this.functionContext.textCode.push(", ");
                });

                // remove last one
                this.functionContext.textCode.pop();

            }

            this.functionContext.textCode.pushNewLineIncrement(")");
        }

        this.emitBeginningOfFunctionScopeForVar(location);

        // select all parameters with default values
        let firstUndefinedParam: ts.IfStatement;
        let lastUndefinedParam: ts.IfStatement;
        if (parameters) {
            // set conditional to variables to 'undefined'
            parameters
                .slice(0)
                .reverse()
                .filter(p => p.questionToken && !p.initializer)
                .map(p => {
                    const currentNode =
                        ts.createIf(
                            ts.createBinary(<ts.Identifier>p.name, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.createNull()),
                            ts.createStatement(ts.createAssignment(<ts.Identifier>p.name, ts.createIdentifier('undefined'))));

                    if (lastUndefinedParam) {
                        lastUndefinedParam.thenStatement = ts.createBlock([lastUndefinedParam.thenStatement, currentNode]);
                    }

                    if (!firstUndefinedParam) {
                        firstUndefinedParam = currentNode;
                    }

                    lastUndefinedParam = currentNode;

                    return currentNode;
                });

            if (firstUndefinedParam) {
                this.processStatement(this.fixupParentReferences(firstUndefinedParam, location));
            }

            // init default values of parameter
            parameters
                .filter(p => p.initializer)
                .map(p => {
                    return this.fixupParentReferences(
                        ts.createIf(
                            ts.createBinary(<ts.Identifier>p.name, ts.SyntaxKind.EqualsEqualsToken, ts.createNull()),
                            ts.createStatement(ts.createAssignment(<ts.Identifier>p.name, p.initializer))),
                        location);
                })
                .forEach(s => {
                    this.processStatement(s);
                });

            // we need to load all '...<>' into arrays
            parameters.filter(p => p.dotDotDotToken).forEach(p => {
                const localVar = this.functionContext.findLocal((<ts.Identifier>p.name).text);
                // TODO: disabled as ...<TABLE> does not work for Array<T>. (finish implementation)
                if (false && this.jsLib) {
                    const initializeNewArg = (arrayRef: ResolvedInfo) => {
                        this.functionContext.code.push([Ops.VARARG, arrayRef.getRegister() + 1, 0, 0]);
                        this.functionContext.code.push([Ops.SETLIST, arrayRef.getRegister(), 0, 1]);
                    };

                    const newArray = ts.createNew(ts.createIdentifier('Array'), undefined, []);
                    this.processNewExpression(
                        this.fixupParentReferences(newArray, location),
                        initializeNewArg);
                    const resultInfo = this.functionContext.stack.pop();

                    this.functionContext.code.push([
                        Ops.MOVE,
                        localVar,
                        resultInfo.getRegister()
                    ]);
                }
            });
        }

        statements.forEach(s => {
            this.processStatement(s);
        });

        if (effectiveLocation.kind !== ts.SyntaxKind.SourceFile) {
            this.functionContext.textCode.decrement();

            this.functionContext.textCode.pushNewLine("end");
        }

        if (!noReturn) {
            this.emitRestoreFunctionEnvironment(location);
        }

        this.functionContext.restoreLocalScope();
        if (effectiveLocation.kind !== ts.SyntaxKind.SourceFile) {
            this.functionContext.restoreScope();
        }

        if (this.functionContext.availableRegister !== 0) {
            //throw new Error('stack is not cleaned up');
        }
    }

    private processFile(sourceFile: ts.SourceFile): void {

        this.functionContext.newFileScope(sourceFile.fileName);

        if (this.generateSourceMap) {
            const filePath: string = Helpers.correctFileNameForLua((<any>sourceFile).__path);

            // check if we have module declaration
            if (this.singleModule) {
                if (!this.fileModuleName) {
                    this.fileModuleName = this.discoverModuleNode(sourceFile);
                }
            }
        }

        this.functionContext.function_or_file_location_node = sourceFile;

        this.sourceFileName = sourceFile.fileName;
        this.processFunctionWithinContext(sourceFile, sourceFile.statements, <any>[], !this.functionContext.environmentCreated, true);
        this.functionContext.environmentCreated = true;
        this.functionContext.is_vararg = true;

        this.functionContext.restoreScope();
    }

    private processBundle(bundle: ts.Bundle): void {
        throw new Error('Method not implemented.');
    }

    private processUnparsedSource(unparsedSource: ts.UnparsedSource): void {
        throw new Error('Method not implemented.');
    }

    private processStatement(node: ts.Statement): void {
        const stackSize = this.markStack();
        this.processStatementInternal(node);
        this.rollbackUnused(stackSize);
    }

    private extraDebugTracePrint(node: ts.Node) {
        let txt = '<no code> ' + ts.SyntaxKind[node.kind];

        try {
            const origin = <ts.Node>(<any>node).__origin;
            if (origin && origin.pos >= 0) {
                txt = origin.getText();
            } else if (node.pos >= 0) {
                txt = node.getText();
            }
        } catch (e) {
        }

        this.extraDebug([
            ts.createStringLiteral(this.functionContext.code.getDebugLine()),
            ts.createStringLiteral(' => '),
            ts.createStringLiteral(txt.substring(0, 140))]);
    }

    private processStatementInternal(node: ts.Statement): void {
        switch (node.kind) {
            case ts.SyntaxKind.EmptyStatement: return;
            case ts.SyntaxKind.VariableStatement: this.processVariableStatement(<ts.VariableStatement>node); break;
            case ts.SyntaxKind.FunctionDeclaration: this.processFunctionDeclaration(<ts.FunctionDeclaration>node); break;
            case ts.SyntaxKind.Block: this.processBlock(<ts.Block>node); return;
            case ts.SyntaxKind.ModuleBlock: this.processModuleBlock(<ts.ModuleBlock>node); break;
            case ts.SyntaxKind.ReturnStatement: this.processReturnStatement(<ts.ReturnStatement>node); break;
            case ts.SyntaxKind.IfStatement: this.processIfStatement(<ts.IfStatement>node); break;
            case ts.SyntaxKind.DoStatement: this.processDoStatement(<ts.DoStatement>node); break;
            case ts.SyntaxKind.WhileStatement: this.processWhileStatement(<ts.WhileStatement>node); break;
            case ts.SyntaxKind.ForStatement: this.processForStatement(<ts.ForStatement>node); break;
            case ts.SyntaxKind.ForInStatement: this.processForInStatement(<ts.ForInStatement>node); break;
            case ts.SyntaxKind.ForOfStatement: this.processForOfStatement(<ts.ForOfStatement>node); break;
            case ts.SyntaxKind.BreakStatement: this.processBreakStatement(<ts.BreakStatement>node); break;
            case ts.SyntaxKind.ContinueStatement: this.processContinueStatement(<ts.ContinueStatement>node); break;
            case ts.SyntaxKind.SwitchStatement: this.processSwitchStatement(<ts.SwitchStatement>node); break;
            case ts.SyntaxKind.ExpressionStatement: this.processExpressionStatement(<ts.ExpressionStatement>node); break;
            case ts.SyntaxKind.TryStatement: this.processTryStatement(<ts.TryStatement>node); break;
            case ts.SyntaxKind.ThrowStatement: this.processThrowStatement(<ts.ThrowStatement>node); break;
            case ts.SyntaxKind.DebuggerStatement: this.processDebuggerStatement(<ts.DebuggerStatement>node); break;
            case ts.SyntaxKind.EnumDeclaration: this.processEnumDeclaration(<ts.EnumDeclaration>node); break;
            case ts.SyntaxKind.ClassDeclaration: this.processClassDeclaration(<ts.ClassDeclaration>node); break;
            case ts.SyntaxKind.ExportDeclaration: this.processExportDeclaration(<ts.ExportDeclaration>node); break;
            case ts.SyntaxKind.ImportDeclaration: this.processImportDeclaration(<ts.ImportDeclaration>node); break;
            case ts.SyntaxKind.ModuleDeclaration: this.processModuleDeclaration(<ts.ModuleDeclaration>node); break;
            case ts.SyntaxKind.NamespaceExportDeclaration: this.processNamespaceDeclaration(<ts.NamespaceDeclaration>node); break;
            case ts.SyntaxKind.InterfaceDeclaration: /*nothing to do*/ return;
            case ts.SyntaxKind.TypeAliasDeclaration: /*nothing to do*/ return;
            case ts.SyntaxKind.ExportAssignment: /*nothing to do*/ return;
            default:
                // TODO: finish it
                throw new Error('Method not implemented.');
        }

        this.functionContext.textCode.pushNewLine();
    }

    private processExpression(node: ts.Expression): void {
        //const node = this.preprocessor.preprocessExpression(nodeIn);

        // we need to process it for statements only
        //// this.functionContext.code.setNodeToTrackDebugInfo(node, this.sourceMapGenerator);

        switch (node.kind) {
            case ts.SyntaxKind.NewExpression: this.processNewExpression(<ts.NewExpression>node); return;
            case ts.SyntaxKind.CallExpression: this.processCallExpression(<ts.CallExpression>node); return;
            case ts.SyntaxKind.PropertyAccessExpression: this.processPropertyAccessExpression(<ts.PropertyAccessExpression>node); return;
            case ts.SyntaxKind.PrefixUnaryExpression: this.processPrefixUnaryExpression(<ts.PrefixUnaryExpression>node); return;
            case ts.SyntaxKind.PostfixUnaryExpression: this.processPostfixUnaryExpression(<ts.PostfixUnaryExpression>node); return;
            case ts.SyntaxKind.BinaryExpression: this.processBinaryExpression(<ts.BinaryExpression>node); return;
            case ts.SyntaxKind.ConditionalExpression: this.processConditionalExpression(<ts.ConditionalExpression>node); return;
            case ts.SyntaxKind.DeleteExpression: this.processDeleteExpression(<ts.DeleteExpression>node); return;
            case ts.SyntaxKind.TypeOfExpression: this.processTypeOfExpression(<ts.TypeOfExpression>node); return;
            case ts.SyntaxKind.FunctionExpression: this.processFunctionExpression(<ts.FunctionExpression>node); return;
            case ts.SyntaxKind.ArrowFunction: this.processArrowFunction(<ts.ArrowFunction>node); return;
            case ts.SyntaxKind.ElementAccessExpression: this.processElementAccessExpression(<ts.ElementAccessExpression>node); return;
            case ts.SyntaxKind.ParenthesizedExpression: this.processParenthesizedExpression(<ts.ParenthesizedExpression>node); return;
            case ts.SyntaxKind.TypeAssertionExpression: this.processTypeAssertionExpression(<ts.TypeAssertion>node); return;
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
            case ts.SyntaxKind.RegularExpressionLiteral: this.processRegularExpressionLiteral(<ts.RegularExpressionLiteral>node); return;
            case ts.SyntaxKind.ThisKeyword: this.processThisExpression(<ts.ThisExpression>node); return;
            case ts.SyntaxKind.SuperKeyword: this.processSuperExpression(<ts.SuperExpression>node); return;
            case ts.SyntaxKind.VoidExpression: this.processVoidExpression(<ts.VoidExpression>node); return;
            case ts.SyntaxKind.NonNullExpression: this.processNonNullExpression(<ts.NonNullExpression>node); return;
            case ts.SyntaxKind.AsExpression: this.processAsExpression(<ts.AsExpression>node); return;
            case ts.SyntaxKind.SpreadElement: this.processSpreadElement(<ts.SpreadElement>node); return;
            case ts.SyntaxKind.AwaitExpression: this.processAwaitExpression(<ts.AwaitExpression>node); return;
            case ts.SyntaxKind.Identifier: this.processIndentifier(<ts.Identifier>node); return;
            case ts.SyntaxKind.ComputedPropertyName: this.processComputedPropertyName(<ts.ComputedPropertyName><any>node); return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processExpressionStatement(node: ts.ExpressionStatement): void {
        this.processExpression(node.expression);
    }

    private fixupParentReferences<T extends ts.Node>(rootNode: T, setParent?: ts.Node): T {
        let parent: ts.Node = rootNode;
        if (setParent) {
            rootNode.parent = setParent;
        }

        ts.forEachChild(rootNode, visitNode);

        return rootNode;

        function visitNode(n: ts.Node): void {
            // walk down setting parents that differ from the parent we think it should be.  This
            // allows us to quickly bail out of setting parents for subtrees during incremental
            // parsing
            if (n.parent !== parent) {
                n.parent = parent;

                const saveParent = parent;
                parent = n;
                ts.forEachChild(n, visitNode);

                parent = saveParent;
            }
        }
    }

    private transpileTSNode(node: ts.Node, transformText?: (string) => string) {
        return this.transpileTSCode(node.getFullText(), transformText);
    }

    private transpileTSCode(code: string, transformText?: (string) => string) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const result = ts.transpileModule(code, { compilerOptions: opts });

        let jsText = result.outputText;
        if (transformText) {
            jsText = transformText(jsText);
        }

        return this.parseJSCode(jsText);
    }

    private parseTSCode(jsText: string) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const sourceFile = ts.createSourceFile(
            this.sourceFileName, jsText, ts.ScriptTarget.ES5, /*setParentNodes */ true, ts.ScriptKind.TS);
        // needed to make typeChecker to work properly
        (<any>ts).bindSourceFile(sourceFile, opts);
        return sourceFile.statements;
    }

    private bind(node: ts.Statement) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const sourceFile = ts.createSourceFile(
            this.sourceFileName, '', ts.ScriptTarget.ES5, /*setParentNodes */ true, ts.ScriptKind.TS);

        (<any>sourceFile.statements) = [node];

        (<any>ts).bindSourceFile(sourceFile, opts);

        return sourceFile.statements[0];
    }

    private parseJSCode(jsText: string) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const sourceFile = ts.createSourceFile('partial', jsText, ts.ScriptTarget.ES5, /*setParentNodes */ true);
        // nneded to make typeChecker to work properly
        (<any>ts).bindSourceFile(sourceFile, opts);
        return sourceFile.statements;
    }

    private processTSNode(node: ts.Node, transformText?: (string) => string) {
        const statements = this.transpileTSNode(node, transformText);
        statements.forEach(s => {
            this.processStatementInternal(s);
        });
    }

    private processTSCode(code: string, parse?: any) {
        const statements = (!parse) ? this.transpileTSCode(code) : this.parseTSCode(code);
        statements.forEach(s => {
            this.processStatementInternal(s);
        });
    }

    private processJSCode(code: string) {
        const statements = this.parseJSCode(code);
        statements.forEach(s => {
            this.processStatementInternal(s);
        });
    }

    private processTryStatement(node: ts.TryStatement): void {

        // 1) get method pcall
        // prepare call for _ENV "pcall"
        // prepare consts
        let envInfo = this.resolver.returnResolvedEnv(this.functionContext);
        let pcallMethodInfo = this.resolver.returnConst('pcall', this.functionContext);

        const pcallResultInfo = this.functionContext.useRegisterAndPush();

        envInfo = this.preprocessConstAndUpvalues(envInfo);
        pcallMethodInfo = this.preprocessConstAndUpvalues(pcallMethodInfo);
        // getting method referene
        this.functionContext.code.push(
            [Ops.GETTABUP, pcallResultInfo.getRegister(), envInfo.getRegisterOrIndex(), pcallMethodInfo.getRegisterOrIndex()]);

        this.stackCleanup(pcallMethodInfo);
        this.stackCleanup(envInfo);

        // 2) get closure
        // prepare Closure
        const protoIndex = this.functionContext.createProto(
            this.processFunction(node, node.tryBlock.statements, undefined));
        const closureResultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([Ops.CLOSURE, closureResultInfo.getRegister(), protoIndex]);

        // 3) calling closure
        // calling PCall
        this.functionContext.code.push([Ops.CALL, pcallResultInfo.getRegister(), 2, 3]);

        // 4) cleanup
        this.functionContext.stack.pop();
        this.functionContext.stack.pop();

        // creating 2 results
        let statusResultInfo = this.functionContext.useRegisterAndPush();
        statusResultInfo.identifierName = 'status';
        const errorResultInfo = this.functionContext.useRegisterAndPush();
        errorResultInfo.identifierName = 'error';

        // process "finally" block
        if (node.finallyBlock) {
            this.processBlock(node.finallyBlock);
        }

        // process 'catch'
        if (node.catchClause) {
            // if status == true, jump over 'catch'-es.
            // create 'true' boolean
            let resolvedInfo = this.resolver.returnConst(true, this.functionContext);

            statusResultInfo = this.preprocessConstAndUpvalues(statusResultInfo);
            resolvedInfo = this.preprocessConstAndUpvalues(resolvedInfo);

            const equalsTo = 1;
            this.functionContext.code.push([
                Ops.EQ, equalsTo, statusResultInfo.getRegisterOrIndex(), resolvedInfo.getRegisterOrIndex()]);

            this.stackCleanup(resolvedInfo);
            this.stackCleanup(statusResultInfo);

            const jmpOp = [Ops.JMP, 0, 0];
            this.functionContext.code.push(jmpOp);
            const casesBlockBegin = this.functionContext.code.length;

            // scope - begin
            this.functionContext.newLocalScope(node.catchClause);

            const variableDeclaration = node.catchClause.variableDeclaration;
            this.functionContext.createLocal((<ts.Identifier>variableDeclaration.name).text, errorResultInfo);

            node.catchClause.block.statements.forEach(s => {
                this.processStatement(s);
            });

            // scope - end
            this.functionContext.restoreLocalScope();

            // end of cases block
            jmpOp[2] = this.functionContext.code.length - casesBlockBegin;
        }

        // final cleanup error & status
        this.functionContext.stack.pop();
        this.functionContext.stack.pop();
    }

    private processThrowStatement(node: ts.ThrowStatement): void {
        const errorCall = ts.createCall(ts.createIdentifier('error'), undefined, [node.expression]);
        this.processExpression(errorCall);
    }

    private processTypeOfExpression(node: ts.TypeOfExpression): void {
        const typeCall = ts.createCall(ts.createIdentifier('___type'), undefined, [node.expression]);
        typeCall.parent = node;
        this.processExpression(typeCall);
    }

    private processDebuggerStatement(node: ts.DebuggerStatement): void {
        const propertyAccessExpression = ts.createPropertyAccess(ts.createIdentifier('debug'), ts.createIdentifier('debug'));
        const debugCall = ts.createCall(
            propertyAccessExpression,
            undefined,
            []);
        // HACK: to stop applying calling SELF instead of GETTABLE
        /// propertyAccessExpression.parent = debugCall;
        debugCall.parent = node;
        this.processExpression(debugCall);
    }

    private processEnumDeclaration(node: ts.EnumDeclaration): void {
        this.functionContext.newLocalScope(node);
        const properties = [];
        let value = 0;
        for (const member of node.members) {
            if (member.initializer) {
                switch (member.initializer.kind) {
                    case ts.SyntaxKind.NumericLiteral:
                        value = parseInt((<ts.NumericLiteral>member.initializer).text, 10);
                        break;
                    default:
                        throw new Error('Not Implemented');
                }
            } else {
                value++;
            }

            const namedProperty = ts.createPropertyAssignment(
                member.name,
                ts.createNumericLiteral(value.toString()));
            properties.push(namedProperty);

            const valueProperty = ts.createPropertyAssignment(
                ts.createComputedPropertyName(ts.createNumericLiteral(value.toString())),
                ts.createStringLiteral((<ts.Identifier>member.name).text));

            properties.push(valueProperty);
        }

        const enumLiteralObject = ts.createObjectLiteral(properties);
        (<any>enumLiteralObject).__origin = node;
        const prototypeObject = ts.createAssignment(node.name, enumLiteralObject);
        this.processExpression(this.fixupParentReferences(prototypeObject, node));

        this.emitExport(node.name, node);

        this.functionContext.restoreLocalScope();
    }

    private processClassDeclaration(node: ts.ClassDeclaration): void {
        this.functionContext.newClassScope(node.name.text);
        this.functionContext.newLocalScope(node);

        this.resolver.thisClassName = node.name;
        this.resolver.thisClassType = node;

        // process methods first
        const properties = node.members
            .filter(m => this.isClassMemberAccepted(m)
                && ((this.isStaticProperty(m) && !this.isPropertyWithNonConstInitializer(m))
                    || !this.isProperty(m)
                    || this.isPropertyWithArrowFunctionInitializer(m)))
            .map(m => {
                const createClassMember = this.createClassMember(m);
                const propertyAssignment = ts.createPropertyAssignment(this.getClassMemberName(m), createClassMember);
                createClassMember.parent = propertyAssignment;
                return propertyAssignment;
            });

        // we need to know if there is any super class before generating default constructor
        const extend = this.getInheritanceFirst(node);
        this.resolver.superClass = extend;

        if (this.isDefaultCtorRequired(node)) {
            // create defualt Ctor to initialize readonlys
            this.createDefaultCtor(node, properties);
        }

        // any get accessor
        if (node.members.some(m => m.kind === ts.SyntaxKind.GetAccessor)) {
            this.createAccessorsCollection(node, properties, true);
        }

        // any set accessor
        if (node.members.some(m => m.kind === ts.SyntaxKind.SetAccessor)) {
            this.createAccessorsCollection(node, properties, false);
        }

        // emit __index of base class
        /*
        const anyGetStaticAccessor = node.members.some(m => m.kind === ts.SyntaxKind.GetAccessor && this.isStatic(m));
        const anySetStaticAccessor = node.members.some(m => m.kind === ts.SyntaxKind.SetAccessor && this.isStatic(m));
        */
        if (extend) {
            const baseClass = ts.createIdentifier(extend.getText());

            // added check if class exists
            const condExpr = ts.createPrefix(ts.SyntaxKind.ExclamationToken, baseClass);
            const throwExpr = ts.createThrow(ts.createStringLiteral('Base class is not defined: ' + (<ts.Identifier>baseClass).text));

            const throwIfClassIsNotDefined = ts.createIf(
                condExpr,
                throwExpr);

            this.processStatement(this.fixupParentReferences(throwIfClassIsNotDefined, node));

            // set base class
            properties.push(ts.createPropertyAssignment('__proto', baseClass));
            /*
            if (!anyGetStaticAccessor && !anySetStaticAccessor) {
                properties.push(ts.createPropertyAssignment('__index', ts.createIdentifier(extend.getText())));
            }
            */
        }

        /*
        if (anyGetStaticAccessor) {
            properties.push(ts.createPropertyAssignment('__index', ts.createIdentifier('__get_static_call__')));
        }

        if (anySetStaticAccessor) {
            properties.push(ts.createPropertyAssignment('__newindex', ts.createIdentifier('__set_static_call__')));
        }
        */

        properties.push(ts.createPropertyAssignment('__index', ts.createIdentifier('__get_call_undefined__')));
        properties.push(ts.createPropertyAssignment('__newindex', ts.createIdentifier('__set_call_undefined__')));

        const prototypeObject = ts.createObjectLiteral(properties);
        properties.forEach(p => p.parent = prototypeObject);

        const prototypeObjectAssignment = ts.createAssignment(node.name, prototypeObject);
        prototypeObject.parent = prototypeObjectAssignment;
        prototypeObjectAssignment.parent = node;
        this.processExpression(prototypeObjectAssignment);

        this.functionContext.textCode.pushNewLine();

        // set metatable for derived class using __index dictionary containing base class
        // if (extend || anyGetStaticAccessor || anySetStaticAccessor) {
        const setmetatableCall = ts.createCall(ts.createIdentifier('setmetatable'), undefined, [node.name, node.name]);
        setmetatableCall.parent = node;
        this.processExpression(setmetatableCall);
        // }

        // process static members
        // process properties later to allow static members to access method in class
        node.members
            .filter(m => this.isClassMemberAccepted(m) && this.isStaticProperty(m) && this.isPropertyWithNonConstInitializer(m))
            .map(m => ts.createAssignment(
                ts.createPropertyAccess(node.name, this.getClassMemberName(m)),
                this.createClassMember(m)))
            .forEach(p => this.processExpression(p));

        // process decorators
        node.members
            .filter(m => m.decorators && m.decorators.some(d => !this.isInternalDecorator(d)))
            .map(m => this.getDecoratorsCallForMember(m))
            .forEach(p => this.processExpression(p));

        this.emitExport(node.name, node);

        this.functionContext.restoreLocalScope();
        this.functionContext.restoreScope();
    }

    private emitExport(name: ts.Identifier, node: ts.Node, fullNamespace?: boolean) {
        const isExport = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!isExport) {
            return;
        }

        this.emitExportInternal(name, node, fullNamespace);
    }

    private emitExportInternal(name: ts.Identifier, node?: ts.Node, fullNamespace?: boolean) {
        if (this.functionContext.namespaces.length === 0) {
            const isDefaultExport = node && node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);
            if (!isDefaultExport) {
                this.emitGetOrCreateObjectExpression(node, 'exports');
                const setExport = ts.createAssignment(
                    ts.createPropertyAccess(ts.createIdentifier('exports'), !isDefaultExport ? name : 'default'), name);
                this.processExpression(setExport);
            } else {
                // return default value
                const returnDefault = ts.createReturn(name);
                returnDefault.parent = node;
                this.processStatement(returnDefault);
            }

            return;
        }

        // save into module
        this.emitSaveToNamespace(name, fullNamespace);
    }

    private extraDebug(args: ReadonlyArray<ts.Expression>) {
        const extraPrint = ts.createCall(ts.createPropertyAccess(ts.createIdentifier('console'), 'log'), undefined, args);
        const state = this.extraDebugEmbed;
        this.extraDebugEmbed = false;
        this.processExpression(extraPrint);
        this.extraDebugEmbed = state;
    }

    private emitSaveToNamespace(name: ts.Identifier, fullNamespace?: boolean) {
        if (this.functionContext.namespaces.length === 0) {
            return;
        }

        // save into module
        const end = fullNamespace ? 0 : this.functionContext.namespaces.length - 1;

        let propertyAccessExpression;
        for (let i = this.functionContext.namespaces.length - 1; i >= end; i--) {
            const namespaceItem = this.functionContext.namespaces.at(i);
            if (propertyAccessExpression) {
                propertyAccessExpression = ts.createPropertyAccess(propertyAccessExpression, <ts.Identifier>namespaceItem.name);
            } else {
                propertyAccessExpression = ts.createPropertyAccess(namespaceItem.name, name);
            }
        }

        const setModuleExport = ts.createAssignment(propertyAccessExpression, name);
        this.processExpression(setModuleExport);
    }

    private createDefaultCtor(node: ts.ClassDeclaration, properties: ts.PropertyAssignment[]) {
        const defaultCtor = this.resolver.superClass != null
            ? ts.createConstructor(
                undefined,
                undefined,
                [ts.createParameter(undefined, undefined, ts.createToken(ts.SyntaxKind.DotDotDotToken), 'params')],
                <ts.Block><any>{
                    kind: ts.SyntaxKind.Block,
                    statements: [
                        // TODO: find out why you need if to call super class constructor (as it should be all the time)
                        ts.createIf(
                            ts.createPropertyAccess(this.resolver.superClass, 'constructor'),
                            ts.createStatement(ts.createCall(ts.createSuper(), undefined, [ts.createSpread(ts.createIdentifier('params'))])))
                    ]
                })
            : ts.createConstructor(
                undefined,
                undefined,
                [],
                <ts.Block><any>{
                    kind: ts.SyntaxKind.Block,
                    statements: [
                    ]
                });

        this.fixupParentReferences(defaultCtor, node);

        // ctor MUST be first
        properties.unshift(ts.createPropertyAssignment(this.getClassMemberName(defaultCtor), this.createClassMember(defaultCtor)));
    }

    private createAccessorsCollection(node: ts.ClassDeclaration, properties: ts.PropertyAssignment[], isGet: boolean) {
        const accessor = isGet ? ts.SyntaxKind.GetAccessor : ts.SyntaxKind.SetAccessor;
        const memberName = isGet ? '__get__' : '__set__';

        const accessorsProperties = node.members
            .filter(f => f.kind === accessor)
            .map(m => ts.createPropertyAssignment(m.name, this.createClassMember(m)));

        const accessorsMember = ts.createObjectLiteral(accessorsProperties);
        accessorsMember.parent = node;
        properties.push(ts.createPropertyAssignment(memberName, accessorsMember));
    }

    private isDefaultCtorRequired(node: ts.ClassDeclaration) {
        if (node.members.some(m => m.kind === ts.SyntaxKind.Constructor)) {
            return false;
        }

        return node.members.some(m => !this.isStaticProperty(m)
            && this.isProperty(m)
            && !this.isPropertyWithArrowFunctionInitializer(m)) ||
            node.members.some(m => m.kind === ts.SyntaxKind.GetAccessor || m.kind === ts.SyntaxKind.SetAccessor);
    }

    private createClassMember(memberDeclaration: ts.ClassElement): ts.Expression {
        switch (memberDeclaration.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                const propertyDeclaration = <ts.PropertyDeclaration>memberDeclaration;
                return propertyDeclaration.initializer/* || ts.createIdentifier('undefined')*/;
            case ts.SyntaxKind.Constructor:
                const constructorDeclaration = <ts.ConstructorDeclaration>memberDeclaration;

                const statements = constructorDeclaration.body.statements;

                // check if first is super();
                let firstStatements = 0;
                if (statements.length > 0 && statements[0].kind === ts.SyntaxKind.ExpressionStatement) {
                    const firstCallStatement = <ts.ExpressionStatement>statements[0];
                    if (firstCallStatement.expression.kind === ts.SyntaxKind.CallExpression) {
                        const firstCall = <ts.CallExpression>firstCallStatement.expression;
                        if (firstCall.expression.kind === ts.SyntaxKind.SuperKeyword) {
                            firstStatements = 1;
                        }
                    }
                }

                const constructorFunction = ts.createFunctionExpression(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    constructorDeclaration.parameters,
                    constructorDeclaration.type, <ts.Block><any>{
                        kind: ts.SyntaxKind.Block,
                        statements: [
                            // super(xxx) call first
                            ...(firstStatements > 0 ? statements.slice(0, firstStatements) : []),
                            ...this.getClassInitStepsToSupportGetSetAccessor(),
                            // initialized members
                            ...((<ts.ClassDeclaration>constructorDeclaration.parent).members
                                .filter(cm => !this.isStaticProperty(cm)
                                    && this.isProperty(cm)
                                    && this.isPropertyWithConstInitializer(cm)
                                    && !this.isPropertyWithArrowFunctionInitializer(cm)))
                                .concat(((<ts.ClassDeclaration>constructorDeclaration.parent).members
                                    .filter(cm => !this.isStaticProperty(cm)
                                        && this.isProperty(cm)
                                        && this.isPropertyWithNonConstInitializer(cm)
                                        && !this.isPropertyWithArrowFunctionInitializer(cm))))
                                .map(p => ts.createStatement(
                                    ts.createAssignment(
                                        ts.createPropertyAccess(ts.createThis(), <ts.Identifier>p.name),
                                        (<ts.PropertyDeclaration>p).initializer/* || ts.createIdentifier('undefined')*/))),
                            // members of class provided in ctor parameters
                            ...constructorDeclaration.parameters
                                .filter(p => p.modifiers && p.modifiers.some(md =>
                                    md.kind === ts.SyntaxKind.PrivateKeyword
                                    || md.kind === ts.SyntaxKind.ProtectedKeyword
                                    || md.kind === ts.SyntaxKind.PublicKeyword))
                                .map(p => ts.createStatement(
                                    ts.createAssignment(
                                        ts.createPropertyAccess(ts.createThis(), <ts.Identifier>p.name),
                                        <ts.Identifier>p.name))),
                            ...statements.slice(firstStatements)
                        ]
                    });
                (<any>constructorFunction).__origin = constructorDeclaration;
                return constructorFunction;
            case ts.SyntaxKind.SetAccessor:
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.MethodDeclaration:
                const methodDeclaration = <ts.MethodDeclaration>memberDeclaration;
                const memberFunction = ts.createFunctionExpression(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    methodDeclaration.parameters,
                    methodDeclaration.type, <ts.Block><any>{
                        kind: ts.SyntaxKind.Block,
                        statements: methodDeclaration.body.statements
                    });
                (<any>memberFunction).__origin = methodDeclaration;
                return memberFunction;
            default:
                throw new Error('Not Implemented');
        }
    }

    private getClassMemberName(memberDeclaration: ts.ClassElement): string {
        switch (memberDeclaration.kind) {
            case ts.SyntaxKind.Constructor:
                return 'constructor';
            case ts.SyntaxKind.SetAccessor:
                return 'set_' + (<ts.Identifier>memberDeclaration.name).text;
            case ts.SyntaxKind.GetAccessor:
                return 'get_' + (<ts.Identifier>memberDeclaration.name).text;
            default:
                return (<ts.Identifier>memberDeclaration.name).text;
        }
    }

    private getDecoratorsCallForMember(member: ts.ClassElement): ts.Expression {
        /*
         __decorate([ BABYLON.serialize() ], Material.prototype, "id", void 0);
        */

        const classNode = member.parent.kind === ts.SyntaxKind.ClassDeclaration ? (<ts.ClassDeclaration>member.parent) : null;
        if (!classNode) {
            throw new Error('Class node can\'t be found');
        }

        const decorators = [];
        for (const decor of member.decorators.filter(d => !this.isInternalDecorator(d))) {
            decorators.push(decor.expression);
        }

        const descriptorValue = member.kind === ts.SyntaxKind.PropertyDeclaration ? ts.createVoidZero() : ts.createNull();
        const callParameters = [
            ts.createArrayLiteral(decorators),
            classNode.name,
            ts.createStringLiteral((<ts.Identifier>member.name).text),
            descriptorValue
        ];

        const callExpr = ts.createCall(ts.createIdentifier('__decorate'), undefined, callParameters);

        this.fixupParentReferences(callExpr, member.parent);

        return callExpr;
    }

    private isPropertyWithConstInitializer(memberDeclaration: ts.ClassElement): any {
        if (memberDeclaration.kind === ts.SyntaxKind.PropertyDeclaration &&
            (<ts.PropertyDeclaration>memberDeclaration).initializer &&
            this.isConstExpression((<ts.PropertyDeclaration>memberDeclaration).initializer)) {
            return true;
        }

        return false;
    }

    private isPropertyWithNonConstInitializer(memberDeclaration: ts.ClassElement): any {
        if (memberDeclaration.kind === ts.SyntaxKind.PropertyDeclaration &&
            (<ts.PropertyDeclaration>memberDeclaration).initializer &&
            !this.isConstExpression((<ts.PropertyDeclaration>memberDeclaration).initializer)) {
            return true;
        }

        return false;
    }

    private isPropertyWithArrowFunctionInitializer(memberDeclaration: ts.ClassElement): any {
        if (memberDeclaration.kind === ts.SyntaxKind.PropertyDeclaration &&
            (<ts.PropertyDeclaration>memberDeclaration).initializer &&
            (<ts.PropertyDeclaration>memberDeclaration).initializer.kind === ts.SyntaxKind.ArrowFunction) {
            return true;
        }

        return false;
    }

    private isStatic(memberDeclaration: ts.Node): any {
        if (memberDeclaration.modifiers &&
            memberDeclaration.modifiers.some(modifer => modifer.kind === ts.SyntaxKind.StaticKeyword)) {
            return true;
        }

        return false;
    }

    private isAbstract(memberDeclaration: ts.Node): any {
        // we do not need - abstract elements
        if (memberDeclaration.modifiers &&
            memberDeclaration.modifiers.some(modifer => modifer.kind === ts.SyntaxKind.AbstractKeyword)) {
            return true;
        }

        return false;
    }

    private isProperty(memberDeclaration: ts.ClassElement): any {
        return memberDeclaration.kind === ts.SyntaxKind.PropertyDeclaration;
    }

    private isMethod(memberDeclaration: ts.ClassElement): any {
        return memberDeclaration.kind === ts.SyntaxKind.MethodDeclaration;
    }

    private isStaticProperty(memberDeclaration: ts.ClassElement): any {
        // we do not need - abstract elements
        if (memberDeclaration.kind === ts.SyntaxKind.PropertyDeclaration &&
            memberDeclaration.modifiers &&
            memberDeclaration.modifiers.some(modifer => modifer.kind === ts.SyntaxKind.StaticKeyword)) {
            return true;
        }

        return false;
    }

    private isConstExpression(expression: ts.Expression): any {
        // we do not need - abstract elements
        switch (expression.kind) {
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
            case ts.SyntaxKind.NumericLiteral:
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.NullKeyword:
                return true;
        }

        return false;
    }

    private isClassMemberAccepted(memberDeclaration: ts.ClassElement): any {
        if (this.isAbstract(memberDeclaration)) {
            return false;
        }

        switch (memberDeclaration.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                const propertyDeclaration = <ts.PropertyDeclaration>memberDeclaration;
                return propertyDeclaration.initializer;

            // to support undefined
            // return true;
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.MethodDeclaration:
                const methodDeclaration = <ts.MethodDeclaration>memberDeclaration;
                return methodDeclaration.body;
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.SetAccessor:
            case ts.SyntaxKind.SemicolonClassElement:
                return false;
            case ts.SyntaxKind.IndexSignature:
                // TODO: investigate implementatino of '[index: number]: T;'
                return false;
            default:
                throw new Error('Not Implemented');
        }
    }

    private getClassInitStepsToSupportGetSetAccessor_Old(memberDeclaration: ts.ClassElement): any {
        const statements = [];
        const node = <ts.ClassDeclaration>memberDeclaration.parent;
        const anyGet = node.members.some(m => m.kind === ts.SyntaxKind.GetAccessor && !this.isStatic(m));
        const anySet = node.members.some(m => m.kind === ts.SyntaxKind.SetAccessor && !this.isStatic(m));
        if (!anyGet && !anySet) {
            return statements;
        }

        if (anyGet) {
            statements.push(ts.createStatement(
                ts.createAssignment(
                    ts.createPropertyAccess(ts.createThis(), '__index'),
                    ts.createIdentifier('__get_call__'))));
        }

        if (anySet) {
            statements.push(ts.createStatement(
                ts.createAssignment(
                    ts.createPropertyAccess(ts.createThis(), '__newindex'),
                    ts.createIdentifier('__set_call__'))));
        }

        return statements;
    }

    private getClassInitStepsToSupportGetSetAccessor(): any {
        const statements = [];
        statements.push(ts.createStatement(
            ts.createAssignment(
                ts.createPropertyAccess(ts.createThis(), '__index'),
                ts.createConditional(
                    ts.createBinary(
                        ts.createTypeOf(ts.createPropertyAccess(ts.createThis(), '__index')),
                        ts.SyntaxKind.EqualsEqualsEqualsToken,
                        ts.createStringLiteral('function')),
                    ts.createPropertyAccess(ts.createThis(), '__index'),
                    ts.createIdentifier('__get_call_undefined__')))));
        statements.push(ts.createStatement(
            ts.createAssignment(
                ts.createPropertyAccess(ts.createThis(), '__newindex'),
                ts.createBinary(
                    ts.createPropertyAccess(ts.createThis(), '__newindex'),
                    ts.SyntaxKind.BarBarToken,
                    ts.createIdentifier('__set_call_undefined__')))));

        return statements;
    }

    private getInheritanceFirst(node: ts.ClassDeclaration): ts.Identifier {
        if (!node.heritageClauses) {
            return;
        }

        let extend: ts.Identifier;
        node.heritageClauses.filter(hc => hc.token === ts.SyntaxKind.ExtendsKeyword).forEach(heritageClause => {
            heritageClause.types.forEach(type => {
                if (!extend) {
                    extend = <ts.Identifier>type.expression;
                }
            });
        });

        return extend;
    }

    private processModuleDeclaration(node: ts.ModuleDeclaration): void {
        const isModuleDeclaration = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DeclareKeyword);
        if (isModuleDeclaration) {
            return;
        }

        this.functionContext.namespaces.push(node);
        this.functionContext.newModuleScope(node.name.text);

        this.emitGetOrCreateObjectExpression(node, node.name.text);
        if (node.body) {
            this.processStatement(<ts.ModuleBlock>node.body);
        }

        this.functionContext.namespaces.pop();

        this.emitSaveToNamespace(<ts.Identifier>node.name);

        this.functionContext.restoreScope();
    }

    private processNamespaceDeclaration(node: ts.NamespaceDeclaration): void {
        this.processModuleDeclaration(node);
    }

    private processExportDeclaration(node: ts.ExportDeclaration): void {
        this.functionContext.newLocalScope(node);

        this.emitGetOrCreateObjectExpression(node, 'exports');

        this.processTSNode(node);
        this.functionContext.restoreLocalScope();
    }

    private processImportDeclaration(node: ts.ImportDeclaration): void {
        // copy exported references from 'exports' object
        if (node.importClause) {
            if (node.importClause.namedBindings) {
                // 1) require './<nodule>'
                const requireCall = ts.createCall(ts.createIdentifier('require'), /*typeArguments*/ undefined, [node.moduleSpecifier]);
                requireCall.parent = node;
                this.processExpression(requireCall);

                switch (node.importClause.namedBindings.kind) {
                    case ts.SyntaxKind.NamespaceImport:
                        const name = node.importClause.namedBindings.name;
                        const assignOfNamespaceImport = ts.createAssignment(
                            name,
                            ts.createIdentifier('exports'));
                        assignOfNamespaceImport.parent = node;
                        this.processExpression(assignOfNamespaceImport);
                        break;
                    case ts.SyntaxKind.NamedImports:
                        const namedImports = <ts.NamedImports>node.importClause.namedBindings;
                        namedImports.elements.forEach(imp => {
                            const assignOfImport = ts.createAssignment(
                                imp.name,
                                ts.createPropertyAccess(ts.createIdentifier('exports'), imp.propertyName || imp.name));
                            assignOfImport.parent = node;
                            this.processExpression(assignOfImport);
                        });
                        break;
                    default:
                        throw new Error('Not Implemented');
                }
            } else {
                // 1) require './<nodule>'
                // const requireCall2 = ts.createCall(ts.createIdentifier('require'), /*typeArguments*/ undefined, [node.moduleSpecifier]);
                // requireCall2.parent = node;
                // this.processExpression(requireCall2);

                // // default case
                // const assignOfImport = ts.createAssignment(
                //     node.importClause.name,
                //     ts.createElementAccess(ts.createIdentifier('exports'), ts.createStringLiteral('default')));
                // assignOfImport.parent = node;
                // this.processExpression(assignOfImport);

                const requireCall2 = ts.createCall(ts.createIdentifier('require'), /*typeArguments*/ undefined, [node.moduleSpecifier]);

                const assignOfImport = ts.createAssignment(
                    node.importClause.name,
                    requireCall2);
                assignOfImport.parent = node;
                requireCall2.parent = assignOfImport;
                this.processExpression(assignOfImport);
            }
        } else {
            const requireCall3 = ts.createCall(ts.createIdentifier('require'), /*typeArguments*/ undefined, [node.moduleSpecifier]);
            requireCall3.parent = node;
            this.processExpression(requireCall3);
        }
    }

    private processVariableDeclarationList(declarationList: ts.VariableDeclarationList, isExport?: boolean): void {

        const ignoreDeclVar = false;// declarationList.parent.kind == ts.SyntaxKind.ForStatement;

        const varAsLet = this.varAsLet
            && this.functionContext.function_or_file_location_node.kind !== ts.SyntaxKind.SourceFile
            && this.functionContext.function_or_file_location_node.kind !== ts.SyntaxKind.ModuleDeclaration;
        declarationList.declarations.forEach(
            d => {
                this.processVariableDeclarationOne(
                    <ts.Identifier>d.name, d.initializer,
                    Helpers.isConstOrLet(declarationList) || varAsLet,
                    isExport,
                    ignoreDeclVar);
                this.functionContext.textCode.pushNewLine();
            });

        this.functionContext.textCode.pop();
    }

    private emitBeginningOfFunctionScopeForVar(location: ts.Node) {
        if (this.varAsLet) {
            if (location.kind !== ts.SyntaxKind.SourceFile && location.kind !== ts.SyntaxKind.ModuleBlock) {
                const declareVars = this.getAllVar(location);
                for (const name of declareVars) {
                    const identifier = ts.createIdentifier(name);
                    identifier.parent = location;
                    this.processVariableDeclarationOne(identifier, undefined, true);
                }
            }

            return;
        }

        if (!this.functionContext.has_var_declaration || this.functionContext.has_var_declaration_done) {
            return;
        }

        this.functionContext.has_var_declaration_done = true;

        // detect nesting level
        const level = this.getFunctionLevelScope();
        const upEnvVar = '_UP' + level;
        const envVar = level > 1 ? '_UP' + (level - 1) : '_ENV';

        const defaultObjLiteral = ts.createObjectLiteral();
        (<any>defaultObjLiteral).__skip_default_metamethods = true;

        // create function env.
        const declareLocalVar = ts.createVariableDeclarationList(
            [ts.createVariableDeclaration(upEnvVar, undefined, defaultObjLiteral)], ts.NodeFlags.Const);
        const varStatement = ts.createVariableStatement(undefined, declareLocalVar);

        this.processStatement(this.fixupParentReferences(varStatement, location));

        const storeCurrentEnv = ts.createAssignment(
            ts.createPropertyAccess(ts.createIdentifier(upEnvVar), ts.createIdentifier('_UP_ENV')),
            ts.createIdentifier('_ENV'));

        this.processExpression(this.fixupParentReferences(storeCurrentEnv, location));

        // creating new function env.
        const newEnv = ts.createAssignment(
            ts.createIdentifier('_ENV'),
            ts.createCall(ts.createIdentifier('setmetatable'), undefined, [
                ts.createIdentifier(upEnvVar),
                ts.createObjectLiteral([
                    ts.createPropertyAssignment('__index', ts.createIdentifier(envVar))
                ])]));

        this.processExpression(this.fixupParentReferences(newEnv, location));
    }

    private emitRestoreFunctionEnvironment(node: ts.Node) {
        if (this.varAsLet) {
            return;
        }

        if (!this.functionContext.has_var_declaration || !this.functionContext.has_var_declaration_done) {
            return;
        }

        // detect nesting level
        const level = this.getFunctionLevelScope();

        const upEnvVar = '_UP' + level;
        const envVar = level > 1 ? '_UP' + (level - 1) : '_ENV';

        // create function env.
        const restoreCurrentEnv =
            ts.createStatement(
                ts.createAssignment(
                    ts.createIdentifier('_ENV'),
                    ts.createPropertyAccess(
                        ts.createIdentifier(upEnvVar),
                        ts.createIdentifier('_UP_ENV'))));

        this.processStatement(this.fixupParentReferences(restoreCurrentEnv, node));
    }

    private processVariableDeclarationOne(name: ts.Identifier, initializer: ts.Expression, isLetOrConst: boolean, isExport?: boolean, ignoreDeclVar?: boolean) {
        const nameText: string = name.text;
        const isModuleScope = this.functionContext.scope.isModule;
        if (!isModuleScope) {
            const localVar = this.functionContext.findScopedLocal(nameText, true);
            if (isLetOrConst && localVar === -1) {

                if (!ignoreDeclVar) {
                    this.functionContext.textCode.push("local ");
                }

                this.functionContext.textCode.push(nameText);
                this.functionContext.textCode.push(" = ");

                if (initializer) {
                    this.processExpression(initializer);
                } else {
                    // this.processNullLiteral(null);
                    this.processExpression(ts.createIdentifier('undefined'));
                }
            } else if (localVar !== -1) {
                if (initializer) {
                    this.functionContext.textCode.push(nameText);
                    this.functionContext.textCode.push(" = ");

                    this.processExpression(initializer);
                }
            } else {
                // var declaration
                if (initializer) {
                    this.functionContext.textCode.push(nameText);
                    this.functionContext.textCode.push(" = ");
                    this.processExpression(initializer);
                } else {
                    this.functionContext.textCode.push(nameText);
                }
            }
        } else {
            // initialize module variable
            if (initializer) {
                this.functionContext.textCode.push(nameText);
                this.functionContext.textCode.push(" = ");
                this.processExpression(initializer);

                if (isExport) {
                    this.emitExportInternal(name);
                }
            }
        }
    }

    private processVariableStatement(node: ts.VariableStatement): void {
        const isExport = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        this.processVariableDeclarationList(node.declarationList, isExport);
    }

    private emitStoreToEnvObjectProperty(nameConstIndex: ResolvedInfo) {
        nameConstIndex = this.preprocessConstAndUpvalues(nameConstIndex);
        this.stackCleanup(nameConstIndex);

        const resolvedInfo = this.functionContext.stack.pop().optimize();

        this.functionContext.code.push([
            Ops.SETTABUP,
            this.resolver.returnResolvedEnv(this.functionContext).getRegisterOrIndex(),
            nameConstIndex.getRegisterOrIndex(),
            resolvedInfo.getRegisterOrIndex()]);
    }

    private processFunctionExpression(node: ts.FunctionExpression): void {
        if (!node.body) {
            // this is declaration
            return;
        }

        const protoIndex = this.functionContext.createProto(
            this.processFunction(node, node.body.statements, node.parameters));
        const resultInfo = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([Ops.CLOSURE, resultInfo.getRegister(), protoIndex]);
    }

    private processArrowFunction(node: ts.ArrowFunction): void {
        if (node.body.kind !== ts.SyntaxKind.Block) {
            // create body
            node.body = ts.createBlock([ts.createReturn(<ts.Expression>node.body)]);
        }

        this.processFunctionExpression(<any>node);
    }

    private processFunctionDeclaration(node: ts.FunctionDeclaration): void {
        if (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DeclareKeyword)) {
            // skip it, as it is only declaration
            return;
        }

        this.processFunctionExpression(<ts.FunctionExpression><any>node);

        this.emitStoreToEnvObjectProperty(this.resolver.returnIdentifier(node.name.text, this.functionContext));

        this.emitExport(node.name, node);
    }

    private processReturnStatement(node: ts.ReturnStatement): void {
        this.functionContext.textCode.push("return");
        if (node.expression) {
            this.functionContext.textCode.push(" ");
            this.processExpression(node.expression);
        }
    }

    private getFunctionLevelScope() {
        let level = 0;
        let sinceVarLevel = 0;
        let current = this.functionContext.container;
        while (current) {
            level++;
            if (current.has_var_declaration) {
                sinceVarLevel = 0;
            } else {
                sinceVarLevel++;
            }

            current = current.container;
        }

        return level > 0 ? level - sinceVarLevel + 1 : 0;
    }

    private hasAnyVarFunctionLevelScope() {
        let level = 0;
        let current = this.functionContext.container;
        while (current) {
            if (current.has_var_declaration) {
                level++;
            }

            current = current.container;
        }

        return level > 0;
    }

    private GetVariableReturn() {
        const location = this.functionContext.current_location_node;
        const ret = location && location.decorators && location.decorators.find(m => m.expression.kind === ts.SyntaxKind.CallExpression
            && (<ts.Identifier>((<ts.CallExpression>m.expression).expression)).text === 'ret');
        return ret;
    }

    private processIfStatement(node: ts.IfStatement): void {

        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.push("if ")
        }
        else {
            this.functionContext.textCode.push("if __is_true(")
        }

        this.processExpression(node.expression);

        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.pushNewLineIncrement(" then ")
        }
        else {
            this.functionContext.textCode.pushNewLineIncrement(") then ")
        }

        this.processStatement(node.thenStatement);
        this.functionContext.textCode.decrement();

        if (node.elseStatement) {
            this.functionContext.textCode.pushNewLineIncrement(" else ")
            this.processStatement(node.elseStatement);
            this.functionContext.textCode.decrement();
        }

        this.functionContext.textCode.push("end")
    }

    private processDoStatement(node: ts.DoStatement): void {
        this.functionContext.newLocalScope(node);

        this.functionContext.textCode.pushNewLineIncrement("repeat")

        this.processStatement(node.statement);
        this.functionContext.textCode.decrement();

        if (this.hasContinue(node)) {
            this.functionContext.textCode.pushNewLine("::continue::")
        }

        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.push("until not(")
        }
        else {
            this.functionContext.textCode.push("until not(__is_true(")
        }

        this.processExpression(node.expression);
        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.push(")")
        }
        else {
            this.functionContext.textCode.push("))")
        }

        this.functionContext.restoreLocalScope();
    }

    private processWhileStatement(node: ts.WhileStatement): void {

        this.functionContext.newLocalScope(node);

        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.push("while ")
        }
        else {
            this.functionContext.textCode.push("while __is_true(")
        }

        this.processExpression(node.expression);

        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.pushNewLineIncrement(" do")
        }
        else {
            this.functionContext.textCode.pushNewLineIncrement(") do")
        }

        this.processStatement(node.statement);
        this.functionContext.textCode.decrement();

        if (this.hasContinue(node)) {
            this.functionContext.textCode.pushNewLine("::continue::")
        }

        this.functionContext.textCode.push("end")

        this.functionContext.restoreLocalScope();
    }

    private processForStatement(node: ts.ForStatement): void {

        this.functionContext.newLocalScope(node);

        /*
        this.functionContext.textCode.push("for ")

        this.processExpression(<ts.Expression>node.initializer);
        this.functionContext.textCode.push(", ")
        this.processExpression(node.condition);
        this.functionContext.textCode.push(", ")
        this.processExpression(node.incrementor);

        this.functionContext.textCode.pushNewLineIncrement(" do")
        this.processStatement(node.statement);
        this.functionContext.textCode.decrement();

        if (this.hasContinue(node))
        {
            this.functionContext.textCode.pushNewLine("::continue::")
        }

        this.functionContext.textCode.push("end")
        */

        this.functionContext.newLocalScope(node);

        if (node.initializer) {
            this.processExpression(<ts.Expression>node.initializer);
            this.functionContext.textCode.pushNewLine()
        }

        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.push("while ")
        }
        else {
            this.functionContext.textCode.push("while __is_true(")
        }

        this.processExpression(node.condition);

        if (this.ignoreExtraLogic) {
            this.functionContext.textCode.pushNewLineIncrement(" do")
        }
        else {
            this.functionContext.textCode.pushNewLineIncrement(") do")
        }

        this.processStatement(node.statement);
        this.functionContext.textCode.decrement();

        if (this.hasContinue(node)) {
            this.functionContext.textCode.pushNewLine("::continue::")
        }

        this.processExpression(node.incrementor);
        this.functionContext.textCode.pushNewLine()

        this.functionContext.textCode.push("end")

        this.functionContext.restoreLocalScope();
    }

    private markStack(): number {
        return this.functionContext.stack.getLength();
    }

    private rollbackUnused(stack: number) {
        if (stack < this.functionContext.stack.getLength()) {
            // we need to remove unused value
            this.functionContext.stack.pop();
        }
    }

    private processForInStatement(node: ts.ForInStatement): void {
        this.functionContext.newLocalScope(node);
        this.processForInStatementNoScope(node);
        this.functionContext.restoreLocalScope();
    }

    private processForInStatementNoScope(node: ts.ForInStatement): void {
        this.functionContext.newLocalScope(node);

        this.functionContext.textCode.push("for ")
        this.processExpression(<ts.Expression>node.initializer);
        this.functionContext.textCode.push(" in pairs(")
        this.processExpression(node.expression);
        this.functionContext.textCode.pushNewLineIncrement(") do")

        this.processStatement(node.statement);
        this.functionContext.textCode.decrement();

        if (this.hasContinue(node)) {
            this.functionContext.textCode.pushNewLine("::continue::")
        }

        this.functionContext.textCode.pushNewLine()

        this.functionContext.textCode.push("end")

        this.functionContext.restoreLocalScope();
    }

    private processForOfStatement(node: ts.ForOfStatement): void {

        // we need to find out type of element
        const typeOfExpression = this.typeInfo.getTypeObject(node.expression);
        const expressionType = this.typeInfo.getNameFromTypeNode(typeOfExpression);
        const typeOfElement = typeOfExpression.typeArguments && typeOfExpression.typeArguments[0];
        let expressionTypeNode;
        let typeNode;
        if (typeOfElement) {
            const typeName = this.typeInfo.getNameFromTypeNode(typeOfElement);
            typeNode = ts.createTypeReferenceNode(typeName, undefined);
        }

        if (expressionType === 'string') {
            expressionTypeNode = ts.createTypeReferenceNode(expressionType, undefined);
            typeNode = ts.createTypeReferenceNode(expressionType, undefined);
        }

        // var
        const indexerName = 'i_';
        const indexerExpr = ts.createIdentifier(indexerName);
        // it is needed to detect type of local variable to support preprocessing correctly
        (<any>indexerExpr).__return_type = 'number';
        const declIndexer = ts.createVariableDeclaration(indexerName, undefined, ts.createNumericLiteral('0'));

        // array
        const arrayInstanceName = 'arr_';
        const arrayInstanceExpr = ts.createIdentifier(arrayInstanceName);
        (<any>arrayInstanceExpr).__return_type = expressionType;
        const declArrayInstance = ts.createVariableDeclaration(arrayInstanceName, expressionTypeNode, node.expression);

        if (expressionTypeNode) {
            expressionTypeNode.parent = declArrayInstance;
        }

        const arrayItem = <ts.Identifier>(<ts.VariableDeclarationList>node.initializer).declarations[0].name;
        const arrayAccess = ts.createElementAccess(arrayInstanceExpr, indexerExpr);

        indexerExpr.parent = arrayAccess;
        arrayInstanceExpr.parent = arrayAccess;

        const arrayItemInitialization = ts.createVariableDeclaration(
            arrayItem, typeNode, arrayAccess);

        if (typeNode) {
            typeNode.parent = arrayItemInitialization;
        }

        arrayAccess.parent = arrayItemInitialization;

        const itemVarDecl = ts.createVariableDeclarationList(
            [arrayItemInitialization],
            node.initializer.flags/*ts.NodeFlags.Const*/);

        arrayItemInitialization.parent = itemVarDecl;

        const varDeclStatement = ts.createVariableStatement(undefined, itemVarDecl);

        itemVarDecl.parent = varDeclStatement;

        const newStatementBlockWithElementAccess = ts.createBlock(
            [
                varDeclStatement,
                node.statement
            ]);

        varDeclStatement.parent = newStatementBlockWithElementAccess;

        const lengthMemeber = ts.createIdentifier('length');
        if (expressionType === 'string') {
            (<any>lengthMemeber).__len = true;
        }

        const varDeclList = ts.createVariableDeclarationList([declArrayInstance, declIndexer], ts.NodeFlags.Const);

        declArrayInstance.parent = varDeclList;
        declIndexer.parent = varDeclList;

        const lengthAccessExpr = ts.createPropertyAccess(arrayInstanceExpr, lengthMemeber);

        lengthMemeber.parent = lengthAccessExpr;

        const indexerComparerExpr =
            ts.createBinary(
                indexerExpr,
                ts.SyntaxKind.LessThanToken,
                lengthAccessExpr);

        lengthAccessExpr.parent = indexerComparerExpr;

        const incrementorExpr = ts.createPostfixIncrement(indexerExpr);
        const forStatement =
            ts.createFor(varDeclList,
                indexerComparerExpr,
                incrementorExpr,
                newStatementBlockWithElementAccess);

        incrementorExpr.parent = forStatement;
        indexerComparerExpr.parent = forStatement;
        varDeclList.parent = forStatement;

        newStatementBlockWithElementAccess.parent = forStatement;

        forStatement.parent = node.parent;
        (<any>forStatement).__origin = node;

        // TODO: if you bind here, you will loose binding in not changes nodes, find out how to avoid it

        this.processStatement(forStatement);
    }

    private processBreakStatement(node: ts.BreakStatement) {
        this.functionContext.textCode.push("break");
    }

    private resolveBreakJumps(jump?: number) {
        this.functionContext.breaks.forEach(b => {
            this.functionContext.code.codeAt(b)[2] = (jump ? jump : this.functionContext.code.length) - b - 1;
        });

        this.functionContext.breaks = [];
    }

    private processContinueStatement(node: ts.ContinueStatement) {
        this.functionContext.textCode.push("goto continue");
    }

    private resolveContinueJumps(jump?: number) {
        this.functionContext.continues.forEach(c => {
            this.functionContext.code.codeAt(c)[2] = (jump ? jump : this.functionContext.code.length) - c - 1;
        });

        this.functionContext.continues = [];
    }

    private processSwitchStatement(node: ts.SwitchStatement) {

        var switchIndex = node.pos.toFixed();

        this.functionContext.textCode.push("local op" + switchIndex + " = ");
        this.processExpression(node.expression);
        this.functionContext.textCode.pushNewLine();

        let count = 0;
        let ignoreElse = false;
        node.caseBlock.clauses.forEach(c => {
            if (count && !ignoreElse) {
                this.functionContext.textCode.decrement();
                this.functionContext.textCode.push("else");
            }

            if (c.kind !== ts.SyntaxKind.DefaultClause) {
                if (!ignoreElse) {
                    this.functionContext.textCode.push("if ");
                }

                this.functionContext.textCode.push("op" + switchIndex + " == ");
            }

            if (c.kind === ts.SyntaxKind.CaseClause) {
                // process 'case'
                const caseClause = <ts.CaseClause>c;
                this.processExpression(caseClause.expression);
            }

            if (c.statements.length > 0) {
                if (c.kind !== ts.SyntaxKind.DefaultClause) {
                    this.functionContext.textCode.pushNewLineIncrement(" then");
                } else {
                    this.functionContext.textCode.pushNewLineIncrement();
                }

                // case or default body
                let statements: any = c.statements;
                const lastStatement = c.statements[c.statements.length - 1];
                if (lastStatement.kind === ts.SyntaxKind.BreakStatement) {
                    statements = c.statements.slice(0, c.statements.length - 1);
                }

                statements.forEach(s => this.processStatement(s));
                ignoreElse = false;
            } else {
                this.functionContext.textCode.push(" or ");
                ignoreElse = true;
            }

            count++;
        });

        this.functionContext.textCode.decrement();
        this.functionContext.textCode.push('end');
    }

    private processBlock(node: ts.Block): void {

        this.functionContext.newLocalScope(node);

        node.statements.forEach(s => {
            this.processStatement(s);
        });

        this.functionContext.restoreLocalScope();
    }

    private processModuleBlock(node: ts.ModuleBlock): void {

        this.functionContext.newLocalScope(node);

        node.statements.forEach(s => {
            this.processStatement(s);
        });

        this.functionContext.restoreLocalScope();
    }

    private processBooleanLiteral(node: ts.BooleanLiteral): void {
        const boolValue = node.kind === ts.SyntaxKind.TrueKeyword;
        this.functionContext.textCode.push(boolValue ? "true" : "false");
    }

    private processNullLiteral(node: ts.NullLiteral): void {
        this.functionContext.textCode.push("nil");
    }

    private processNumericLiteral(node: ts.NumericLiteral): void {
        this.functionContext.textCode.push(node.text);
    }

    private processStringLiteral(node: ts.StringLiteral): void {
        this.functionContext.textCode.push("\"" + node.text.replace(/(\r?\n)/g, "\\$1") + "\"");
    }

    private processNoSubstitutionTemplateLiteral(node: ts.NoSubstitutionTemplateLiteral): void {
        this.processStringLiteral(<ts.StringLiteral><any>node);
    }

    private processTemplateExpression(node: ts.TemplateExpression): void {
        this.processTSNode(node);
    }

    private processRegularExpressionLiteral(node: ts.RegularExpressionLiteral): void {
        const identifier = ts.createIdentifier('RegExp');
        const index = node.text.lastIndexOf('/');
        const arg1 = index >= 0 ? node.text.substr(1, index - 1) : node.text;
        const arg2 = index >= 0 ? node.text.substr(index + 1) : '';
        let expr;
        if (arg2 !== '') {
            expr = ts.createNew(identifier, undefined, [ts.createStringLiteral(arg1), ts.createStringLiteral(arg2)]);
        } else {
            expr = ts.createNew(identifier, undefined, [ts.createStringLiteral(arg1)]);
        }

        expr.parent = node;
        identifier.parent = expr;
        this.processNewExpression(expr);
    }

    private processObjectLiteralExpression(node: ts.ObjectLiteralExpression): void {
        const resultInfo = this.functionContext.useRegisterAndPush();

        this.functionContext.textCode.pushNewLineIncrement("{");

        let callSetMetatable = false;
        let props: Array<ts.Node> = node.properties.slice(0);
        // set default get/set methods
        if ((props && props.length === 0) && !(<any>node).__skip_default_metamethods) {
            props = new Array<ts.Node>();
            props.push(ts.createPropertyAssignment('__index', ts.createIdentifier('__get_call_undefined__')));
            props.push(ts.createPropertyAssignment('__newindex', ts.createIdentifier('__set_call_undefined__')));
            callSetMetatable = true;
        }

        props.filter(e => e.kind !== ts.SyntaxKind.SpreadAssignment).forEach((e: ts.ObjectLiteralElementLike, index: number) => {
            // set 0 element
            this.resolver.Scope.push(node);
            this.processExpression(<ts.Expression><any>e.name);
            this.resolver.Scope.pop();

            this.functionContext.textCode.push(" = ");

            // we need to remove scope as expression is not part of object
            if (e.kind === ts.SyntaxKind.ShorthandPropertyAssignment) {
                this.processExpression(<ts.Expression><any>e.name);
            } else if (e.kind === ts.SyntaxKind.PropertyAssignment) {
                this.processExpression(e.initializer);
            } else {
                throw new Error('Not Implemented');
            }

            this.functionContext.textCode.pushNewLine(",");
        });

        props.filter(e => e.kind === ts.SyntaxKind.SpreadAssignment).forEach((e: ts.ObjectLiteralElementLike, index: number) => {
            // creating foreach loop for each spread object
            const spreadAssignment = <ts.SpreadAssignment>e;

            const objLocal = ts.createIdentifier('obj_');
            objLocal.flags = ts.NodeFlags.Const;
            const indexLocal = ts.createIdentifier('i_');
            const forInSetStatement = ts.createForIn(
                ts.createVariableDeclarationList([ts.createVariableDeclaration(indexLocal)], ts.NodeFlags.Const),
                spreadAssignment.expression,
                ts.createStatement(ts.createAssignment(
                    ts.createElementAccess(objLocal, indexLocal),
                    ts.createElementAccess(spreadAssignment.expression, indexLocal))));
            forInSetStatement.parent = node;
            // this is important call to allow to resolve local variables
            // TODO: but it does not work here, why?
            // this.bind(forInSetStatement);

            this.processForInStatementNoScope(forInSetStatement);
        });

        if (callSetMetatable) {
            //this.emitSetMetatableCall(resultInfo);
        }

        this.functionContext.textCode.decrement();
        this.functionContext.textCode.push("}");
    }

    private processArrayLiteralExpression(node: ts.ArrayLiteralExpression): void {

        const initializeArrayFunction = (arrayRef: ResolvedInfo) => {

            this.functionContext.textCode.push("{");

            if (node.elements.length > 0) {
                // set 0 element
                this.processExpression(<ts.Expression><any>ts.createComputedPropertyName(ts.createNumericLiteral('0')));
                this.functionContext.textCode.push(" = ");
                this.processExpression(node.elements[0]);
                this.functionContext.textCode.push(", ");

                // set 0|1.. elements
                const reversedValues = node.elements.slice(1);
                if (reversedValues.length > 0) {
                    reversedValues.forEach((e, index: number) => {
                        this.processExpression(e);
                        this.functionContext.textCode.push(", ");
                    });
                }


                if (!this.jsLib) {
                    this.functionContext.textCode.push("length = " + node.elements.length);
                } else {
                    this.functionContext.textCode.pop();
                }
            }

            this.functionContext.textCode.push("}");
        };

        let resultInfo;
        if (this.jsLib) {
            const ident = ts.createIdentifier('Array');
            const newArray = ts.createNew(ident, undefined, []);
            ident.parent = ident;
            newArray.parent = node;
            this.processNewExpression(newArray, initializeArrayFunction);
        } else {
            initializeArrayFunction(resultInfo);
        }
    }

    private processElementAccessExpression(node: ts.ElementAccessExpression): void {
        this.processExpression(node.expression);
        this.functionContext.textCode.push("[");
        this.processExpression(node.argumentExpression);
        this.functionContext.textCode.push("]");
    }

    private processComputedPropertyName(node: ts.ComputedPropertyName): void {
        this.functionContext.textCode.push("[");
        this.processExpression(node.expression);
        this.functionContext.textCode.push("]");
    }

    private processParenthesizedExpression(node: ts.ParenthesizedExpression) {
        this.functionContext.textCode.push("(");
        this.processExpression(node.expression);
        this.functionContext.textCode.push(")");
    }

    private processTypeAssertionExpression(node: ts.TypeAssertion) {
        this.processExpression(node.expression);

        if (node.type.kind === ts.SyntaxKind.InterfaceDeclaration) {
            //
        }
    }

    private processPrefixUnaryExpression(node: ts.PrefixUnaryExpression): void {
        let opCode;
        switch (node.operator) {
            case ts.SyntaxKind.MinusToken:
                this.functionContext.textCode.push("-");
                this.processExpression(node.operand);
                break;
            case ts.SyntaxKind.TildeToken:
                this.functionContext.textCode.push("~");
                this.processExpression(node.operand);
                break;
            case ts.SyntaxKind.ExclamationToken:
                this.functionContext.textCode.push("not(");
                this.processExpression(node.operand);
                this.functionContext.textCode.push(")");
                break;

            case ts.SyntaxKind.PlusPlusToken:
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" = ");
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" + 1");
                break;
            case ts.SyntaxKind.MinusMinusToken:
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" = ");
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" - 1");
                break;

            case ts.SyntaxKind.PlusToken:
                this.functionContext.textCode.push("+");
                this.processExpression(node.operand);
                break;
            default:
                throw new Error('Not Implemented');
        }
    }

    private processPostfixUnaryExpression(node: ts.PostfixUnaryExpression): void {
        switch (node.operator) {
            case ts.SyntaxKind.PlusPlusToken:
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" = ");
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" + 1");
                break;
            case ts.SyntaxKind.MinusMinusToken:
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" = ");
                this.processExpression(node.operand);
                this.functionContext.textCode.push(" - 1");
                break;
        }
    }

    private processConditionalExpression(node: ts.ConditionalExpression): void {
        this.functionContext.textCode.push("__cond(");
        this.processExpression(node.condition);
        this.functionContext.textCode.push(", ");
        this.processExpression(node.whenTrue);
        this.functionContext.textCode.push(", ");
        this.processExpression(node.whenFalse);
        this.functionContext.textCode.push(")");
    }

    private processBinaryExpression(node: ts.BinaryExpression): void {
        switch (node.operatorToken.kind) {
            case ts.SyntaxKind.EqualsToken:

                if (this.isValueNotRequired(node.parent)) {
                    this.processExpression(node.left);
                    this.functionContext.textCode.push(" = ");
                    this.processExpression(node.right);
                } else {
                    this.functionContext.textCode.push("__assign(");
                    this.processExpression(node.left);
                    this.functionContext.textCode.push(", ");
                    this.processExpression(node.right);
                    this.functionContext.textCode.push(")");
                }

                break;
            case ts.SyntaxKind.PlusToken:

                if (this.typeInfo.isTypeOfNode(node.left, 'string')
                    || this.typeInfo.isTypeOfNode(node.right, 'string')) {
                    this.processExpression(node.left);
                    this.functionContext.textCode.push(" .. ");
                    this.processExpression(node.right);
                }
                else {
                    this.processExpression(node.left);
                    this.functionContext.textCode.push(" + ");
                    this.processExpression(node.right);
                }

                break;
            case ts.SyntaxKind.MinusToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" - ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.AsteriskToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" * ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.AsteriskAsteriskToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" ** ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.PercentToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" % ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.CaretToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" ^ ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.SlashToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" / ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.AmpersandToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" & ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.BarToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" | ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.LessThanLessThanToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" << ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.GreaterThanGreaterThanToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" >> ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" >> ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.PlusEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" += ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.MinusEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" -= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.AsteriskEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" *= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" **= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.PercentEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" %= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.CaretEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" ^= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.SlashEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" /= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.AmpersandEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" &= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.BarEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" |= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.LessThanLessThanEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" <<= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" >>= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" >>= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.EqualsEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" == ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.EqualsEqualsEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" == ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.LessThanToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" < ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.LessThanEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" <= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.ExclamationEqualsToken:
                this.functionContext.textCode.push("not ");
                this.processExpression(node.left);
                this.functionContext.textCode.push(" == ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                this.functionContext.textCode.push("not ");
                this.processExpression(node.left);
                this.functionContext.textCode.push(" == ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.GreaterThanToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" > ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.GreaterThanEqualsToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" >= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.AmpersandAmpersandToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" and ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.BarBarToken:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" or ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.InKeyword:
                this.processExpression(node.left);
                this.functionContext.textCode.push(" ~= ");
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.CommaToken:
                this.processExpression(node.left);
                this.functionContext.textCode.pushNewLine();
                this.processExpression(node.right);
                break;
            case ts.SyntaxKind.InstanceOfKeyword:
                this.functionContext.textCode.push("__instanceOf(");
                this.processExpression(node.left);
                this.functionContext.textCode.push(", ");
                this.processExpression(node.right);
                this.functionContext.textCode.push(")");
                break;
        }
    }

    private processDeleteExpression(node: ts.DeleteExpression): void {
        /*
        const assignNull = ts.createAssignment(node.expression, ts.createNull());
        this.fixupParentReferences(assignNull, node);
        this.processExpression(assignNull);
        */

        // we need to set it do undefined first
        const assignUndefined = ts.createAssignment(node.expression, ts.createIdentifier('undefined'));
        this.fixupParentReferences(assignUndefined, node);
        this.processExpression(assignUndefined);

        // then delete using lua
        let obj;
        let indx;
        let property;
        if (node.expression.kind === ts.SyntaxKind.ElementAccessExpression) {
            const elementAccessExpression = <ts.ElementAccessExpression>node.expression;
            obj = elementAccessExpression.expression;
            indx = elementAccessExpression.argumentExpression;
        } else if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccessExpression = <ts.PropertyAccessExpression>node.expression;
            obj = propertyAccessExpression.expression;
            indx = propertyAccessExpression.name;
            property = true;
        } else {
            throw new Error('Not implemented');
        }

        const rawsetCall = ts.createCall(
            ts.createIdentifier('rawset'), undefined, [
            obj,
            property && indx.kind === ts.SyntaxKind.Identifier ? ts.createStringLiteral(indx.text) : indx,
            ts.createNull()]);
        this.fixupParentReferences(rawsetCall, node);
        this.processExpression(rawsetCall);
    }

    private processNewExpression(node: ts.NewExpression, extraCodeBeforeConstructor?: (arrayRef: ResolvedInfo) => void): void {

        /*
        // special cases: new Array and new Object
        if (!this.jsLib) {
            if (node.expression.kind === ts.SyntaxKind.Identifier && (!node.arguments || node.arguments.length === 0)) {
                const name = node.expression.getText();
                if (name === 'Object') {
                    return this.processObjectLiteralExpression(ts.createObjectLiteral());
                }

                if (name === 'Array') {
                    return this.processArrayLiteralExpression(ts.createArrayLiteral());
                }

                if (name === 'String') {
                    return this.processStringLiteral(ts.createStringLiteral(''));
                }
            }
        }
        */

        this.functionContext.textCode.push("__new(");
        this.processExpression(node.expression);
        this.functionContext.textCode.push(")");

        /*
        // throw exception if class is not defined
        const condExpr = ts.createPrefix(ts.SyntaxKind.ExclamationToken, node.expression);
        const throwExpr = ts.createThrow(ts.createStringLiteral('Class is not defined: ' + (<ts.Identifier>node.expression).text));

        const throwIfClassIsNotDefined = ts.createIf(
            condExpr,
            throwExpr);

        this.processStatement(this.fixupParentReferences(throwIfClassIsNotDefined, node));

        this.processExpression(
            ts.createObjectLiteral([
                ts.createPropertyAssignment('__proto', node.expression),
                ts.createPropertyAssignment('__index', node.expression)
            ]));
        const resultInfo = this.functionContext.stack.peek();

        this.emitSetMetatableCall(resultInfo);

        if (extraCodeBeforeConstructor) {
            extraCodeBeforeConstructor(resultInfo);
        }

        // call constructor
        const methodInfo = this.functionContext.useRegisterAndPush();
        let constructorInfo = this.resolver.returnConst('constructor', this.functionContext);

        const reserveSpace = this.functionContext.useRegisterAndPush();
        constructorInfo = this.preprocessConstAndUpvalues(constructorInfo);

        this.functionContext.code.push([
            Ops.SELF,
            methodInfo.getRegister(),
            resultInfo.getRegister(),
            constructorInfo.getRegisterOrIndex()]);

        this.stackCleanup(constructorInfo);
        // cleanup of reserve
        this.functionContext.stack.pop();

        // to reserve 'this' register
        this.functionContext.useRegisterAndPush();

        // in case of empty constructor we need to skip call
        // test for null
        this.functionContext.code.push([Ops.TEST, methodInfo.getRegister(), 0]);
        const jmpOp = [Ops.JMP, 0, 0];
        this.functionContext.code.push(jmpOp);
        const beforeBlock = this.functionContext.code.length;

        // test for undefined
        this.processIndentifier(this.fixupParentReferences(ts.createIdentifier('undefined'), node));
        const undefInfo = this.functionContext.stack.pop();

        this.functionContext.code.push([Ops.EQ, 1, methodInfo.getRegister(), undefInfo.getRegister()]);
        const jmpOp2 = [Ops.JMP, 0, 0];
        this.functionContext.code.push(jmpOp2);
        const beforeBlock2 = this.functionContext.code.length;

        this.emitCallOfLoadedMethod(
            <ts.CallExpression><any>{ parent: node, 'arguments': node.arguments || [] },
            resultInfo,
            true);

        jmpOp2[2] = this.functionContext.code.length - beforeBlock2;
        jmpOp[2] = this.functionContext.code.length - beforeBlock;
        */
    }

    private emitSetMetatableCall(resultInfo: ResolvedInfo) {
        this.processExpression(ts.createIdentifier('setmetatable'));
        const setmetatableInfo = this.functionContext.stack.peek();
        // call setmetatable(obj, obj)
        const param1Info = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([
            Ops.MOVE, param1Info.getRegister(), resultInfo.getRegisterOrIndex()
        ]);
        const param2Info = this.functionContext.useRegisterAndPush();
        this.functionContext.code.push([
            Ops.MOVE, param2Info.getRegister(), resultInfo.getRegisterOrIndex()
        ]);
        // call setmetatable
        this.functionContext.code.push([
            Ops.CALL, setmetatableInfo.getRegister(), 3, 1
        ]);

        // call cleanup
        this.functionContext.stack.pop();
        this.functionContext.stack.pop();
        this.functionContext.stack.pop();
    }

    private processCallExpression(node: ts.CallExpression): void {

        this.resolver.pushAndSetMethodCallInfo();

        this.processExpression(node.expression);
        this.functionContext.textCode.push("(");

        if (node.arguments.length > 0) {
            node.arguments.forEach(a => {
                this.processExpression(a);
                this.functionContext.textCode.push(", ");
            });

            this.functionContext.textCode.pop();
        }

        this.functionContext.textCode.push(")");
    }

    private isValueNotRequired(parent: ts.Node): boolean {
        if (!parent) {
            return true;
        }

        return parent.kind === ts.SyntaxKind.ExpressionStatement
            || parent.kind === ts.SyntaxKind.VoidExpression
            || parent.kind === ts.SyntaxKind.ClassDeclaration
            || parent.kind === ts.SyntaxKind.EnumDeclaration
            || parent.kind === ts.SyntaxKind.ImportDeclaration
            || parent.kind === ts.SyntaxKind.ForStatement
            || parent.kind === ts.SyntaxKind.ForInStatement
            || parent.kind === ts.SyntaxKind.ForOfStatement;
    }

    private emitCallOfLoadedMethod(node: ts.CallExpression, _thisForNew?: ResolvedInfo, constructorCall?: boolean) {
        let wrapCallMethod = false;
        node.arguments.forEach(a => {
            // pop method arguments
            this.processExpression(a);
            if ((<any>a).__self_call_required) {
                wrapCallMethod = true;
            }
        });
        node.arguments.forEach(a => {
            this.functionContext.stack.pop();
        });
        if (_thisForNew) {
            this.functionContext.stack.pop();
        }

        const methodResolvedInfo = this.functionContext.stack.pop();
        // TODO: temporary solution: if method called in Statement then it is not returning value
        const parent = node.parent;
        const noReturnCall = constructorCall || this.isValueNotRequired(parent);
        let isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral = parent && parent.kind === ts.SyntaxKind.SpreadElement;
        if (!isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral
            && parent
            && (parent.kind === ts.SyntaxKind.CallExpression
                || parent.kind === ts.SyntaxKind.NewExpression)) {
            // check if it last call method argument
            const callMethod = <ts.CallExpression>parent;
            if (callMethod.arguments.length > 0 && callMethod.arguments[callMethod.arguments.length - 1] === node) {
                isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral = true;
            }
        }

        if (!isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral
            && parent
            && (parent.kind === ts.SyntaxKind.ArrayLiteralExpression)) {
            // check if it last element
            const callMethod = <ts.ArrayLiteralExpression>parent;
            if (callMethod.elements.length > 0 && callMethod.elements[callMethod.elements.length - 1] === node) {
                isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral = true;
            }
        }

        if (!isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral
            && parent
            && parent.kind === ts.SyntaxKind.ReturnStatement) {
            // support variable return
            const ret = this.GetVariableReturn();
            if (ret) {
                isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral = true;
            }
        }

        const returnCount = noReturnCall ? 1 : isLastMethodArgumentCallOrSpreadElementOrLastOfArrayLiteral ? 0 : 2;
        if (returnCount !== 1) {
            this.functionContext.useRegisterAndPush();
        }

        // parameters number
        let parametersNumber = node.arguments.length + 1 + (_thisForNew || wrapCallMethod ? 1 : 0);
        if (node.arguments.some(a => a.kind === ts.SyntaxKind.SpreadElement)) {
            parametersNumber = 0;
        } else if (node.arguments.length === 1 && node.arguments.some(a => a.kind === ts.SyntaxKind.CallExpression)) {
            // there is only 1 parameter and it is method call
            parametersNumber = 0;
        }

        this.functionContext.code.push(
            [
                Ops.CALL,
                methodResolvedInfo.getRegister(),
                parametersNumber,
                returnCount
            ]);
    }

    private processThisExpression(node: ts.ThisExpression): void {

        const thisInfo = this.resolver.returnLocalOrUpvalue('this', this.functionContext);
        this.emitLoadValue(thisInfo);

        /*
        if (this.functionContext.thisInUpvalue) {
            const resolvedInfo = this.resolver.returnThisUpvalue(this.functionContext);

            const resultInfo = this.functionContext.useRegisterAndPush();
            resultInfo.originalInfo = resolvedInfo;
            this.functionContext.code.push([Ops.GETUPVAL, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
            return;
        }

        if (this.functionContext.isStatic) {
            this.processExpression(this.resolver.thisClassName);
            return;
        }

        const resultThisInfo = this.functionContext.useRegisterAndPush();
        resultThisInfo.originalInfo = this.resolver.returnThis(this.functionContext);
        this.functionContext.code.push([Ops.MOVE, resultThisInfo.getRegister(), resultThisInfo.originalInfo.getRegisterOrIndex()]);
        */
    }

    private processSuperExpression(node: ts.SuperExpression): void {
        if (node.parent.kind === ts.SyntaxKind.CallExpression) {
            // this is construction call
            const constructorCall = ts.createPropertyAccess(this.resolver.superClass, ts.createIdentifier('constructor'));
            constructorCall.parent = node.parent;
            (<any>constructorCall).__self_call_required = false;
            this.processExpression(constructorCall);
        } else {
            this.processExpression(this.resolver.superClass);
        }
    }

    private processVoidExpression(node: ts.VoidExpression): void {
        // call expression
        this.processExpression(node.expression);
        this.functionContext.stack.pop();

        // convert it into null
        this.processExpression(ts.createIdentifier('undefined'));
    }

    private processNonNullExpression(node: ts.NonNullExpression): void {
        this.processExpression(node.expression);
    }

    private processAsExpression(node: ts.AsExpression): void {
        this.processExpression(node.expression);
    }

    private processSpreadElement(node: ts.SpreadElement): void {
        // load first element
        const zeroElementAccessExpression = ts.createElementAccess(node.expression, ts.createNumericLiteral('0'));
        zeroElementAccessExpression.parent = node;
        this.processExpression(zeroElementAccessExpression);

        this.functionContext.textCode.push(", ");

        const propertyAccessExpression = ts.createPropertyAccess(ts.createIdentifier('table'), ts.createIdentifier('unpack'));
        const spreadCall = ts.createCall(
            propertyAccessExpression,
            undefined,
            [node.expression]);
        spreadCall.parent = node;
        this.processExpression(spreadCall);
    }

    private processAwaitExpression(node: ts.AwaitExpression): void {
        const newFunctionBlock = ts.createBlock([ts.createReturn(node.expression)]);
        const newFunction = ts.createFunctionExpression([], undefined, undefined, undefined, [], undefined, newFunctionBlock);
        const createCall = ts.createCall(ts.createPropertyAccess(ts.createIdentifier('coroutine'), 'create'), undefined, [
            newFunction
        ]);
        // create call: coroutine.resume(coroutine.create(6))
        const callResume = ts.createCall(ts.createPropertyAccess(ts.createIdentifier('coroutine'), 'resume'), undefined, [
            createCall
        ]);

        const callTablePack = ts.createCall(ts.createPropertyAccess(ts.createIdentifier('table'), 'pack'), undefined, [
            callResume
        ]);

        const getSecondValue = ts.createElementAccess(callTablePack, 2);

        createCall.parent = callResume;
        callResume.parent = callTablePack;
        callTablePack.parent = getSecondValue;
        getSecondValue.parent = node.parent;

        this.bind(ts.createExpressionStatement(getSecondValue));

        (<any>callResume).__origin = node;

        // reset parent after bind
        getSecondValue.parent = node.parent;

        this.processExpression(getSecondValue);
    }

    private preprocessConstAndUpvalues(resolvedInfo: ResolvedInfo): ResolvedInfo {
        if (this.allowConstBigger255 && !this.splitConstFromOpCode) {
            return resolvedInfo;
        }

        const can1 = resolvedInfo.canUseIndex();
        if (can1 && !(this.splitConstFromOpCode && resolvedInfo.kind === ResolvedKind.Const)) {
            return resolvedInfo;
        }

        if (resolvedInfo.kind === ResolvedKind.Const) {
            const resultInfo = this.functionContext.useRegisterAndPush();
            resultInfo.originalInfo = resolvedInfo.originalInfo;
            resultInfo.popRequired = true;
            this.functionContext.code.push([Ops.LOADK, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
            return resultInfo;
        }

        throw new Error('Not Implemented');
    }

    private stackCleanup(resolvedInfo: ResolvedInfo) {
        if (resolvedInfo.popRequired) {
            this.functionContext.stack.pop();
        }
    }

    private processIndentifier(node: ts.Identifier): void {
        const resolvedInfo = this.resolver.resolver(<ts.Identifier>node, this.functionContext);
        this.emitLoadValue(resolvedInfo);

        this.functionContext.textCode.push((<ts.Identifier>node).text);
    }

    private emitLoadValue(resolvedInfo: ResolvedInfo) {
        if (resolvedInfo.kind === ResolvedKind.Register) {
            const resultInfo = this.functionContext.useRegisterAndPush();
            resultInfo.originalInfo = resolvedInfo;
            this.functionContext.code.push([Ops.MOVE, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
            return;
        }

        if (resolvedInfo.kind === ResolvedKind.Upvalue) {
            const resultInfo = this.functionContext.useRegisterAndPush();
            resultInfo.originalInfo = resolvedInfo;
            this.functionContext.code.push([Ops.GETUPVAL, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
            return;
        }

        if (resolvedInfo.kind === ResolvedKind.Const) {
            if (resolvedInfo.value === null) {
                const resultInfoNull = this.functionContext.useRegisterAndPush();
                resultInfoNull.originalInfo = resolvedInfo;
                this.functionContext.code.push([Ops.LOADNIL, resultInfoNull.getRegister(), 1]);
                return;
            }

            const resultInfo = this.functionContext.useRegisterAndPush();
            resultInfo.originalInfo = resolvedInfo;
            this.functionContext.code.push([Ops.LOADK, resultInfo.getRegister(), resolvedInfo.getRegisterOrIndex()]);
            return;
        }

        if (resolvedInfo.kind === ResolvedKind.LoadGlobalMember) {
            let objectIdentifierInfo = resolvedInfo.objectInfo;
            let memberIdentifierInfo = resolvedInfo.memberInfo;
            memberIdentifierInfo.isTypeReference = resolvedInfo.isTypeReference;
            memberIdentifierInfo.isDeclareVar = resolvedInfo.isDeclareVar;
            memberIdentifierInfo.isGlobalReference = resolvedInfo.isGlobalReference;
            memberIdentifierInfo.declarationInfo = resolvedInfo.declarationInfo;

            const resultInfo = this.functionContext.useRegisterAndPush();
            resultInfo.originalInfo = memberIdentifierInfo;

            objectIdentifierInfo = this.preprocessConstAndUpvalues(objectIdentifierInfo);
            memberIdentifierInfo = this.preprocessConstAndUpvalues(memberIdentifierInfo);

            this.functionContext.code.push(
                [Ops.GETTABUP,
                resultInfo.getRegister(),
                objectIdentifierInfo.getRegisterOrIndex(),
                memberIdentifierInfo.getRegisterOrIndex()]);

            this.stackCleanup(memberIdentifierInfo);
            this.stackCleanup(objectIdentifierInfo);

            return;
        }

        throw new Error('Not Implemeneted');
    }

    private popDependancy(target: ResolvedInfo, dependancy: ResolvedInfo) {
        dependancy.chainPop = target;
        target.hasPopChain = true;
    }

    private processPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        this.processExpression(node.expression);

        let thisCall = false;
        // this.<...>(this support)
        if (node.parent
            && node.parent.kind === ts.SyntaxKind.CallExpression
            && (<ts.CallExpression>node.parent).expression == node) {
            thisCall = true;

            const objectHolder = this.resolver.getSymbolAtLocation(node.expression);
            if (objectHolder && objectHolder.valueDeclaration) {
                if (objectHolder.valueDeclaration.type) {
                    thisCall = objectHolder.valueDeclaration.type.kind != ts.SyntaxKind.TypeReference;
                } else {
                    thisCall = objectHolder.valueDeclaration.kind != ts.SyntaxKind.ClassDeclaration;
                }
            }
        }

        // support __wrapper calls
        const wrapMethodCall = (<any>node).__self_call_required === true;
        if (wrapMethodCall) {
            thisCall = true;
        }

        if ((<any>node).__self_call_required === false) {
            // suppress self call
            thisCall = false;
        }

        if (thisCall && !wrapMethodCall) {
            this.functionContext.textCode.push(":");
        }
        else {
            this.functionContext.textCode.push(".");
        }

        this.processExpression(node.name);
    }

    private emitGetOrCreateObjectExpression(node: ts.Node, globalVariableName: string) {
        const prototypeIdentifier = ts.createIdentifier(globalVariableName);
        const binOper =
            ts.createBinary(
                prototypeIdentifier,
                ts.SyntaxKind.BarBarToken,
                ts.createObjectLiteral());

        const getOrCreateObjectExpr =
            ts.createAssignment(
                prototypeIdentifier,
                binOper);

        binOper.parent = getOrCreateObjectExpr;
        prototypeIdentifier.parent = getOrCreateObjectExpr;
        getOrCreateObjectExpr.parent = node.parent;

        this.processExpression(getOrCreateObjectExpr);
    }

    private emitFunction(functionContext: FunctionContext): void {
        this.emitFunctionCode(functionContext);
    }

    private emitFunctionCode(functionContext: FunctionContext): void {
        functionContext.textCode.forEach(c => {
            this.writer.writeString(c);
        });
    }
}
