import * as ts from 'typescript';
import { FunctionContext } from './contexts';
import { Helpers } from './helpers';

export enum ResolvedKind {
    // up values
    Upvalue,
    // const
    Const,
    // registers
    Register,
    // to support methods load
    LoadMember,
    // load array element
    LoadElement,
    // to support loading closures
    LoadFunction,
    // fake stack record
    MethodCall
}

export class ResolvedInfo {
    public kind: ResolvedKind;
    public value: any;
    public name: string;
    public node: ts.Node;
    public currentInfo: ResolvedInfo;
    public parentInfo: ResolvedInfo;
    public root: boolean;
    private const_index: number;

    public ensureConstIndex(functionContext: FunctionContext): number {
        if (this.kind !== ResolvedKind.Const) {
            throw new Error('It is not Const');
        }

        if (this.const_index !== undefined) {
            return this.const_index;
        }

        return this.const_index = -functionContext.findOrCreateConst(this.value);
    }

    public getRegisterNumberOrIndex() {
        if (this.const_index !== undefined) {
            return this.const_index;
        }

        if (this.kind === ResolvedKind.Register) {
            return this.value;
        }

        if (this.kind === ResolvedKind.Upvalue) {
            return this.value;
        }

        if (this.kind === ResolvedKind.LoadFunction) {
            return this.value;
        }

        throw new Error('It is not register or const index');
    }

    public getRegisterNumber() {
        if (this.kind === ResolvedKind.Register) {
            return this.value;
        }

        throw new Error('It is not register or const index');
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
        return this.stack.pop();
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

    public peek(): any {
        return this.scope[this.scope.length - 1];
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

    public resolver(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if (this.Scope.anyNotRoot()) {
            return this.resolveMemberOfCurrentScope(identifier, functionContext);
        }

        const resolved = (<any>this.typeChecker).resolveName(identifier.text, undefined, ((1 << 27) - 1)/*mask for all types*/);
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
                    if (resolved.flags !== 2) {
                        return this.resolveMemberOfCurrentScope(identifier, functionContext);
                    } else {
                        const resolvedInfo = new ResolvedInfo();
                        resolvedInfo.kind = ResolvedKind.Register;
                        resolvedInfo.name = identifier.text;
                        resolvedInfo.value = functionContext.findLocal(resolvedInfo.name);
                        return resolvedInfo;
                    }

                    break;

                case ts.SyntaxKind.FunctionDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier, functionContext);
            }
        }

        // TODO: hack
        throw new Error('Could not resolve: ' + identifier.text);
    }

    public returnResolvedEnv(functionContext: FunctionContext, root?: boolean): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo();
        resolvedInfo.kind = ResolvedKind.Upvalue;
        resolvedInfo.name = '_ENV';
        resolvedInfo.value = -functionContext.findOrCreateUpvalue(resolvedInfo.name);
        resolvedInfo.root = root;
        return resolvedInfo;
    }

    private resolveMemberOfCurrentScope(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if (!this.Scope.any()) {
            this.Scope.push(this.returnResolvedEnv(functionContext, true));
        }

        const parentScope: any = this.Scope.peek();
        if (parentScope && parentScope.kind === ResolvedKind.Upvalue) {
            const resolvedInfo = new ResolvedInfo();
            resolvedInfo.kind = ResolvedKind.Const;
            resolvedInfo.name = identifier.text;

            // resolve _ENV
            // TODO: hack
            if (parentScope.name === '_ENV') {
                switch (resolvedInfo.name) {
                    case 'log': resolvedInfo.name = 'print'; break;
                }
            }

            // to load Const
            resolvedInfo.value = resolvedInfo.name;

            if (!parentScope.root) {
                return resolvedInfo;
            }

            const finalResolvedInfo = new ResolvedInfo();
            finalResolvedInfo.kind = ResolvedKind.LoadMember;
            finalResolvedInfo.parentInfo = parentScope;
            finalResolvedInfo.currentInfo = resolvedInfo;
            return finalResolvedInfo;
        }

        throw new Error('Method not implemented');
    }
}
