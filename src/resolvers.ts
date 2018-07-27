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
}

export class ResolvedInfo {
    public kind: ResolvedKind;
    public value: number;
    public name: string;
    public node: ts.Node;
    public currentInfo: ResolvedInfo;
    public parentInfo: ResolvedInfo;
}

export class StackResolver {
    private stack: any[] = [];

    public push(item: any) {
        if (!item) {
            throw new Error('Item is not defined');
        }

        this.stack.push(item);
    }

    public pop(): any {
        return this.stack.pop();
    }

    public peek(): any {
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
}

export class IdentifierResolver {

    public Scope: ScopeContext = new ScopeContext();

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    public resolver(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if (this.Scope.any()) {
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

                    if (!Helpers.isConstOrLet(identifier)) {
                        return this.resolveMemberOfCurrentScope(identifier, functionContext);
                    } else {
                        // TODO: finish returning info about local variable
                        throw new Error('Not Implemented');
                    }

                    break;

                case ts.SyntaxKind.FunctionDeclaration:
                    return this.resolveMemberOfCurrentScope(identifier, functionContext);
            }
        }

        // TODO: hack
        throw new Error('Could not resolve: ' + identifier.text);
    }

    public returnResolvedEnv(functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo();
        resolvedInfo.kind = ResolvedKind.Upvalue;
        resolvedInfo.name = '_ENV';
        resolvedInfo.value = -functionContext.findOrCreateUpvalue(resolvedInfo.name);
        return resolvedInfo;
    }

    private resolveMemberOfCurrentScope(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if (!this.Scope.any()) {
            this.Scope.push(this.returnResolvedEnv(functionContext));
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

            resolvedInfo.value = -functionContext.findOrCreateConst(resolvedInfo.name);
            return resolvedInfo;
        }

        throw new Error('Method not implemented');
    }
}
