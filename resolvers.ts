import * as ts from "typescript";
import { FunctionContext } from './contexts';

export enum ResolvedKind {
    Upvalue,
    Const
}

export class ResolvedInfo {
    public kind: ResolvedKind;
    public value: number;
    public name: string;
}

export class IdentifierResolver {

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    public resolver(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        if ((<any>identifier).resolved_owner) {
            return this.resolveMemberOfResolvedOwner(identifier, functionContext);
        }

		let resolved = (<any>this.typeChecker).resolveName(identifier.text, undefined, ((1 << 27) - 1)/*mask for all types*/);
        if (resolved)
        {
        }
        
        // TODO: hack
        if (identifier.text == "console") {
            var resolvedInfo = new ResolvedInfo();
            resolvedInfo.kind = ResolvedKind.Upvalue;
            resolvedInfo.name = "_ENV";
            resolvedInfo.value = -functionContext.findOrCreateUpvalue(resolvedInfo.name);
            return resolvedInfo;
        }

        throw new Error("Coult not resolve: " + identifier.text);
    }

    private resolveMemberOfResolvedOwner(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        let owner: any = (<any>identifier).resolved_owner;
        if (owner.resolved_value && owner.resolved_value.kind == ResolvedKind.Upvalue) {
            var resolvedInfo = new ResolvedInfo();
            resolvedInfo.kind = ResolvedKind.Const;
            resolvedInfo.name = identifier.text;

            // resolve _ENV
            // TODO: hack
            if (owner.resolved_value.name == "_ENV") {
                switch (resolvedInfo.name) {
                    case "log": resolvedInfo.name = "print"; break;
                }
            }

            resolvedInfo.value = -functionContext.findOrCreateConst(resolvedInfo.name);
            return resolvedInfo;
        }
    }
}
