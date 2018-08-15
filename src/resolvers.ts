import * as ts from 'typescript';
import { FunctionContext } from './contexts';
import { Ops, OpMode, OpCodes, LuaTypes } from './opcodes';

export enum ResolvedKind {
    // up values
    Upvalue,
    // const
    Const,
    // registers
    Register,
    // to support methods load
    LoadGlobalMember,
    // load array element
    LoadElement,
    // to support loading closures
    Closure
}

export class ResolvedInfo {
    public kind: ResolvedKind;
    public value: any;
    public identifierName: string;
    public memberInfo: ResolvedInfo;
    public objectInfo: ResolvedInfo;
    public register: number;
    public constIndex: number;
    public upvalueIndex: number;
    public protoIndex: number;
    public upvalueInstack: boolean;
    public upvalueStackIndex: number;
    public root: boolean;
    public originalInfo: ResolvedInfo;

    public constructor(private functionContext: FunctionContext) {
    }

    public isLocal(): boolean {
        return this.kind === ResolvedKind.Register
            && this.register !== undefined
            && this.functionContext.isRegisterLocal(this.register);
    }

    public isEmptyRegister(): boolean {
        return this.kind === ResolvedKind.Register && this.register === undefined;
    }

    public isThis(): boolean {
        return this.kind === ResolvedKind.Register && this.register === 0 && this.identifierName === 'this';
    }

    public ensureConstIndex(): number {
        if (this.kind !== ResolvedKind.Const) {
            throw new Error('It is not Const');
        }

        if (this.constIndex !== undefined) {
            return this.constIndex;
        }

        if (this.value === undefined && this.identifierName === undefined) {
            throw new Error('Value is undefined or IdentifierName to create Const');
        }

        return this.constIndex = -this.functionContext.findOrCreateConst(this.value !== undefined ? this.value : this.identifierName);
    }

    public ensureUpvalueIndex(): number {
        if (this.kind !== ResolvedKind.Upvalue) {
            throw new Error('It is not Upvalue');
        }

        if (this.upvalueIndex !== undefined) {
            return this.upvalueIndex;
        }

        return this.upvalueIndex = this.functionContext.findOrCreateUpvalue(
            this.identifierName, this.upvalueInstack, this.upvalueStackIndex);
    }

    public getRegisterOrIndex(): number {
        if (this.kind === ResolvedKind.Register) {
            return this.register;
        }

        if (this.kind === ResolvedKind.Upvalue) {
            return this.ensureUpvalueIndex();
        }

        if (this.kind === ResolvedKind.Closure) {
            return this.protoIndex;
        }

        if (this.kind === ResolvedKind.Const) {
            return this.ensureConstIndex();
        }

        throw new Error('It is not register or const index');
    }

    public getRegister(): number {
        if (this.kind === ResolvedKind.Register) {
            return this.register;
        }

        throw new Error('It is not register or const index');
    }

    public getUpvalue(): number {
        if (this.kind === ResolvedKind.Upvalue) {
            return this.ensureUpvalueIndex();
        }

        throw new Error('It is not upvalue');
    }

    public getProto(): number {
        if (this.kind === ResolvedKind.Closure) {
            return this.protoIndex;
        }

        throw new Error('It is not Closure');
    }

    public optimize(skip?: boolean): ResolvedInfo {
        // TODO: finish optimization for code
        // let x;
        // x = ~ 5;
        // console.log(x);

        // TODO: finish optimization for logic operations
        if (skip) {
            return this;
        }

        if (this.kind !== ResolvedKind.Register) {
            return this;
        }

        if (this.functionContext.code.length === 0) {
            return this;
        }

        // we need to suppres redundant LOADK & MOVES
        const opCodes = this.functionContext.code[this.functionContext.code.length - 1];
        if (opCodes[0] === Ops.LOADK) {
            this.kind = ResolvedKind.Const;
            this.constIndex = opCodes[2];
            // remove optimized code
            this.functionContext.code.pop();
            return this;
        }

        if (opCodes[0] === Ops.MOVE && opCodes[1] === this.register) {
            this.register = opCodes[2];
            // remove optimized code
            this.functionContext.code.pop();
            return this;
        }

        return this;
    }
}

export class StackResolver {
    private stack: ResolvedInfo[] = [];

    public constructor(private functionContext: FunctionContext) {
    }

    public push(item: ResolvedInfo) {
        if (!item) {
            throw new Error('Item is not defined');
        }

        this.stack.push(item);
    }

    public pop(): ResolvedInfo {
        const stackItem = this.stack.pop();
        this.functionContext.popRegister(stackItem);
        return stackItem;
    }

    public peek(): ResolvedInfo {
        return this.stack[this.stack.length - 1];
    }
}

export class ScopeContext {
    private scope: any[] = [];

    public push(item: any) {
        if (!item) {
            throw new Error('Item is not defined');
        }

        this.scope.push(item);
    }

    public pop(): any {
        return this.scope.pop();
    }

    public peek(index?: number): any {
        return this.scope[index ? index : this.scope.length - 1];
    }

    public getLength(): any {
        return this.scope.length;
    }

    public any(): boolean {
        return this.scope.length > 0;
    }

    public anyNotRoot(): boolean {
        return this.scope.length > 1 || this.scope.length > 0 && !this.scope[this.scope.length - 1].root;
    }
}

export class IdentifierResolver {

    public Scope: ScopeContext = new ScopeContext();

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    public methodCall: boolean;

    public getTypeAtLocation(location: ts.Node): any {
        return (<any>this.typeChecker).getTypeAtLocation(location);
    }

    public resolver(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if (this.Scope.anyNotRoot()) {
            return this.resolveMemberOfCurrentScope(identifier, functionContext);
        }

        const resolved = (<any>this.typeChecker).resolveName(
            identifier.text,
            functionContext.current_location_node || functionContext.function_or_file_location_node,
            ((1 << 27) - 1)/*mask for all types*/);
        if (resolved) {
            const kind: ts.SyntaxKind = <ts.SyntaxKind>resolved.valueDeclaration.kind;
            switch (kind) {
                case ts.SyntaxKind.VariableDeclaration:
                    const type = resolved.valueDeclaration.type;
                    // can be keyward to 'string'
                    if (type && type.typeName) {
                        switch (type.typeName.text) {
                            case 'Console':
                                return this.returnResolvedEnv(functionContext);
                        }
                    }

                    // values are not the same as Node.Flags
                    if ((resolved.flags & 1) === 1) {
                        return this.resolveMemberOfCurrentScope(identifier, functionContext);
                    } else if ((resolved.flags & 2) === 2) {
                        return this.returnLocalOrUpvalue(identifier.text, functionContext);
                    } else {
                        throw new Error('Not implemented');
                    }

                    break;

                case ts.SyntaxKind.Parameter:
                    return this.returnLocal(identifier.text, functionContext);

                case ts.SyntaxKind.FunctionDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier, functionContext);

                case ts.SyntaxKind.EnumDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier, functionContext);

                case ts.SyntaxKind.ClassDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier, functionContext);
            }
        }

        console.warn('Could not resolve: ' + identifier.text);

        // default
        return this.resolveMemberOfCurrentScope(identifier, functionContext);
    }

    public returnConst(value: any, functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Const;
        resolvedInfo.value = value;
        resolvedInfo.ensureConstIndex();
        return resolvedInfo;
    }

    public returnLocal(text: string, functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Register;
        resolvedInfo.identifierName = text;
        resolvedInfo.register = functionContext.findLocal(resolvedInfo.identifierName);
        return resolvedInfo;
    }

    public returnThis(functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Register;
        resolvedInfo.identifierName = 'this';
        resolvedInfo.register = 0;
        return resolvedInfo;
    }

    public returnResolvedEnv(functionContext: FunctionContext, root?: boolean): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Upvalue;
        resolvedInfo.identifierName = '_ENV';
        resolvedInfo.upvalueInstack = functionContext.container ? false : true;
        resolvedInfo.root = root;
        resolvedInfo.ensureUpvalueIndex();
        return resolvedInfo;
    }

    public returnLocalOrUpvalue(text: string, functionContext: FunctionContext): ResolvedInfo {

        const localVarIndex = functionContext.findLocal(text, true);
        if (localVarIndex !== -1) {
            const resolvedInfo = new ResolvedInfo(functionContext);
            resolvedInfo.kind = ResolvedKind.Register;
            resolvedInfo.identifierName = text;
            resolvedInfo.register = localVarIndex;
            return resolvedInfo;
        }

        if (functionContext.container) {
            const localVarIndexAsUpvalue = functionContext.container.findLocal(text, true);
            if (localVarIndexAsUpvalue !== -1) {
                const resolvedInfo = new ResolvedInfo(functionContext);
                resolvedInfo.kind = ResolvedKind.Upvalue;
                resolvedInfo.identifierName = text;
                resolvedInfo.upvalueInstack = true;
                resolvedInfo.upvalueStackIndex = localVarIndexAsUpvalue;
                return resolvedInfo;
            }
        }

        throw new Error('Could not find variable');
    }

    private resolveMemberOfCurrentScope(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if (!this.Scope.any()) {
            const objectInfo = this.returnResolvedEnv(functionContext, true);
            const methodInfo = new ResolvedInfo(functionContext);
            methodInfo.kind = ResolvedKind.Const;
            methodInfo.identifierName = identifier.text;
            methodInfo.ensureConstIndex();

            const loadMemberInfo = new ResolvedInfo(functionContext);
            loadMemberInfo.kind = ResolvedKind.LoadGlobalMember;
            loadMemberInfo.objectInfo = objectInfo;
            loadMemberInfo.memberInfo = methodInfo;
            return loadMemberInfo;
        }

        let identifierName = identifier.text;
        const parentScope: any = this.Scope.peek();
        if (parentScope && parentScope.kind === ResolvedKind.Register || parentScope.kind === ts.SyntaxKind.ObjectLiteralExpression) {
            // HACK
            if (parentScope.originalInfo
                && parentScope.originalInfo.kind === ResolvedKind.Upvalue
                && parentScope.originalInfo.identifierName === '_ENV') {
                if (identifier.text === 'log') {
                    identifierName = 'print';
                }
            }
        }

        const finalResolvedInfo = new ResolvedInfo(functionContext);
        finalResolvedInfo.kind = ResolvedKind.Const;
        finalResolvedInfo.identifierName = identifierName;
        finalResolvedInfo.ensureConstIndex();
        return finalResolvedInfo;
    }
}
