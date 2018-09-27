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
    public originalInfo: ResolvedInfo;
    public isTypeReference: boolean;

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

    public collapseConst(skip?: boolean): ResolvedInfo {
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
        const opCodes = this.functionContext.code.latest;
        if (opCodes[0] === Ops.LOADK) {
            this.kind = ResolvedKind.Const;
            this.constIndex = opCodes[2];
            // remove optimized code
            this.functionContext.code.pop();
            return this;
        }

        return this;
    }

    public optimize(skip?: boolean): ResolvedInfo {
        // TODO: finish optimization for code
        // let x;
        // x = ~ 5;
        // console.log(x);

        // TODO: finish optimization for logic operations
        /*
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
        const opCodes = this.functionContext.code.latest;
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
        */

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

    public getLength(): any {
        return this.stack.length;
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
}

export class IdentifierResolver {

    public Scope: ScopeContext = new ScopeContext();

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    private unresolvedFilter = {
        '__instanceof': true, '__get_call__': true, '__set_call__': true, 'setmetatable': true, 'debug': true, 'type': true, 'error': true,
        'require': true, 'exports': true, 'table': true, 'tostring': true, 'tonumber': true, 'rawset': true, 'rawget': true
    };

    public methodCall: boolean;
    public thisMethodCall: ResolvedInfo;

    public getTypeAtLocation(location: ts.Node): any {
        return (<any>this.typeChecker).getTypeAtLocation(location);
    }

    public resolver(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if (this.Scope.any()) {
            return this.resolveMemberOfCurrentScope(identifier.text, functionContext);
        }

        let resolved;
        try {
            if (functionContext.current_location_node) {
                resolved = (<any>this.typeChecker).resolveName(
                identifier.text,
                functionContext.current_location_node,
                ((1 << 27) - 1)/*mask for all types*/);
            }
        } catch (e) {
        }

        try {
            if (!resolved && functionContext.function_or_file_location_node) {
                let originLocation = functionContext.function_or_file_location_node;
                if ((<any>originLocation).__origin) {
                    originLocation = (<any>originLocation).__origin;
                }

                resolved = (<any>this.typeChecker).resolveName(
                    identifier.text,
                    originLocation,
                    ((1 << 27) - 1)/*mask for all types*/);
            }
        } catch (e) {
            console.warn('Can\'t resolve "' + identifier.text + '"');
        }

        if (!resolved
            && functionContext.current_location_node
            && functionContext.current_location_node.kind === ts.SyntaxKind.ClassDeclaration) {
            // 1 find constructor
            const constuctorMember = (<ts.ClassDeclaration>functionContext.current_location_node)
                .members.find(m => m.kind === ts.SyntaxKind.Constructor);
            if (constuctorMember) {
                resolved = (<any>this.typeChecker).resolveName(
                    identifier.text,
                    constuctorMember,
                    ((1 << 27) - 1)/*mask for all types*/);
            }
        }

        if (resolved) {
            const declaration = resolved.valueDeclaration
                                || (resolved.declarations && resolved.declarations.length > 0 ? resolved.declarations[0] : undefined);
            if (!declaration) {
                if (resolved.name === 'undefined') {
                    return this.returnConst(null, functionContext);
                }

                if (resolved.name === 'arguments') {
                    return this.resolveMemberOfCurrentScope('arg', functionContext);
                }

                throw Error('Can\'t find declaration for "' + identifier.text + '"');
            }

            const kind: ts.SyntaxKind = <ts.SyntaxKind>declaration.kind;
            switch (kind) {
                case ts.SyntaxKind.VariableDeclaration:
                    const type = (resolved.valueDeclaration || resolved.exportSymbol.valueDeclaration).type;
                    // can be keyward to 'string'
                    if (type && type.typeName) {
                        switch (type.typeName.text) {
                            case 'Console':
                                return this.returnResolvedEnv(functionContext);
                            case 'Math':
                                const memberInfo = this.resolveMemberOfCurrentScope(identifier.text.toLowerCase(), functionContext);
                                memberInfo.isTypeReference = type.kind === ts.SyntaxKind.TypeReference;
                                return memberInfo;
                        }
                    }

                    // values are not the same as Node.Flags
                    if ((resolved.flags & 1) === 1) {
                        return this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    } else if ((resolved.flags & 2) === 2) {
                        return this.returnLocalOrUpvalueNoException(identifier.text, functionContext)
                               || this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    } else {
                        console.warn('Can\'t detect scope (let, const, var) for \'' + identifier.text + '\'');
                        this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    }

                    break;

                case ts.SyntaxKind.Parameter:
                    return this.returnLocalOrUpvalue(identifier.text, functionContext);

                case ts.SyntaxKind.FunctionDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier.text, functionContext);

                case ts.SyntaxKind.EnumDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier.text, functionContext);

                case ts.SyntaxKind.ClassDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier.text, functionContext);
            }
        }

        // default: local, upvalues
        const localObj = this.returnLocalOrUpvalueNoException(identifier.text, functionContext);
        if (localObj) {
            return localObj;
        }

        if (!(identifier.text in this.unresolvedFilter)) {
            console.warn('Could not resolve: ' + identifier.text);
        }

        // default
        return  this.resolveMemberOfCurrentScope(identifier.text, functionContext);
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

    public returnThisUpvalue(functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Upvalue;
        resolvedInfo.identifierName = 'this';
        resolvedInfo.upvalueInstack = true;
        resolvedInfo.upvalueStackIndex = 0;
        return resolvedInfo;
    }

    public createEnv(functionContext: FunctionContext) {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Upvalue;
        resolvedInfo.identifierName = '_ENV';
        resolvedInfo.upvalueInstack = true;
        resolvedInfo.ensureUpvalueIndex();
    }

    public returnResolvedEnv(functionContext: FunctionContext): ResolvedInfo {
        return this.returnLocalOrUpvalue('_ENV', functionContext);
    }

    public returnUpvalue(text: string, functionContext: FunctionContext): ResolvedInfo {
        if (functionContext.container) {
            const identifierResolvedInfo = this.returnLocalOrUpvalueNoException(text, functionContext.container);
            if (!identifierResolvedInfo) {
                return identifierResolvedInfo;
            }

            if (identifierResolvedInfo.kind === ResolvedKind.Register
                && identifierResolvedInfo.isLocal) {
                const resolvedInfo = new ResolvedInfo(functionContext);
                resolvedInfo.kind = ResolvedKind.Upvalue;
                resolvedInfo.identifierName = text;
                resolvedInfo.upvalueInstack = true;
                resolvedInfo.upvalueStackIndex = identifierResolvedInfo.register;
                return resolvedInfo;
            }

            if (identifierResolvedInfo.kind === ResolvedKind.Upvalue) {
                identifierResolvedInfo.ensureUpvalueIndex();
                const resolvedInfo = new ResolvedInfo(functionContext);
                resolvedInfo.kind = ResolvedKind.Upvalue;
                resolvedInfo.identifierName = text;
                resolvedInfo.upvalueInstack = false;
                resolvedInfo.upvalueStackIndex = identifierResolvedInfo.upvalueIndex;
                return resolvedInfo;
            }
        }

        return null;
    }

    public returnLocalOrUpvalueNoException(text: string, functionContext: FunctionContext): ResolvedInfo {
        const localVarIndex = functionContext.findLocal(text, true);
        if (localVarIndex !== -1) {
            const resolvedInfo = new ResolvedInfo(functionContext);
            resolvedInfo.kind = ResolvedKind.Register;
            resolvedInfo.identifierName = text;
            resolvedInfo.register = localVarIndex;
            return resolvedInfo;
        }

        const upvalueIndex = functionContext.findUpvalue(text, true);
        if (upvalueIndex !== -1) {
            const resolvedInfo = new ResolvedInfo(functionContext);
            resolvedInfo.kind = ResolvedKind.Upvalue;
            resolvedInfo.identifierName = text;
            resolvedInfo.upvalueIndex = upvalueIndex;
            resolvedInfo.upvalueStackIndex = functionContext.upvalues[upvalueIndex].index;
            resolvedInfo.upvalueInstack = functionContext.upvalues[upvalueIndex].instack;
            return resolvedInfo;
        }

        return this.returnUpvalue(text, functionContext);
    }

    public returnLocalOrUpvalue(text: string, functionContext: FunctionContext): ResolvedInfo {
        const result = this.returnLocalOrUpvalueNoException(text, functionContext);
        if (result) {
            return result;
        }

        throw new Error('Could not find variable');
    }

    private resolveMemberOfCurrentScope(identifier: string, functionContext: FunctionContext): ResolvedInfo {
        if (!this.Scope.any()) {
            const objectInfo = this.returnResolvedEnv(functionContext);
            const methodInfo = new ResolvedInfo(functionContext);
            methodInfo.kind = ResolvedKind.Const;
            methodInfo.identifierName = identifier;
            methodInfo.ensureConstIndex();

            const loadMemberInfo = new ResolvedInfo(functionContext);
            loadMemberInfo.kind = ResolvedKind.LoadGlobalMember;
            loadMemberInfo.objectInfo = objectInfo;
            loadMemberInfo.memberInfo = methodInfo;
            return loadMemberInfo;
        }

        // HACK mapping to LUA methods
        let identifierName = identifier;
        const parentScope: any = this.Scope.peek();
        if (parentScope && (parentScope.kind === ResolvedKind.Register || parentScope.kind === ts.SyntaxKind.ObjectLiteralExpression)) {
            // HACK
            if (parentScope.originalInfo) {
                if (parentScope.originalInfo.kind === ResolvedKind.Upvalue) {
                    if (parentScope.originalInfo.identifierName === '_ENV') {
                        if (identifier === 'log') {
                            identifierName = 'print';
                        }
                    }
                } else if (parentScope.originalInfo.kind === ResolvedKind.Const) {
                    if (parentScope.originalInfo.identifierName === 'math') {
                        identifierName = identifier.toLowerCase();
                    }
                }
            }
        }

        // end of HACK

        const finalResolvedInfo = new ResolvedInfo(functionContext);
        finalResolvedInfo.kind = ResolvedKind.Const;
        finalResolvedInfo.identifierName = identifierName;
        finalResolvedInfo.ensureConstIndex();
        return finalResolvedInfo;
    }
}
