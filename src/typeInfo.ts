import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';

export class TypeInfo {

    public constructor(private resolver: IdentifierResolver) {
    }

    public isTypeOfNode(node: ts.Node, typeName: string) {
        return this.getTypeOfNode(node) === typeName;
    }

    public isTypesOfNode(node: ts.Node, typeNames: string[]) {
        const res = this.getTypeOfNode(node);
        return typeNames.some(t => t === res);
    }

    public getNameFromTypeNode(detectType: any): string {
        const val =
            detectType.intrinsicName && detectType.intrinsicName !== 'unknown'
            ? detectType.intrinsicName
            : detectType.value !== undefined
                ? typeof (detectType.value)
                : detectType.symbol
                    ? detectType.symbol.name
                    : detectType.target && (detectType.target.objectFlags & ts.ObjectFlags.Tuple) === ts.ObjectFlags.Tuple
                        ? 'tuple'
                        : (detectType.objectFlags & ts.ObjectFlags.Anonymous) === ts.ObjectFlags.Anonymous
                            ? 'anonymous'
                            : undefined;

        return val;
    }

    public getTypeOfNode(node: ts.Node) {
        if (!node) {
            return undefined;
        }

        if ((<any>node).__return_type) {
            return (<any>node).__return_type;
        }

        try {
            let typeName;

            if (node.kind === ts.SyntaxKind.StringLiteral) {
                typeName = 'string';
            } else if (node.kind === ts.SyntaxKind.NumericLiteral) {
                typeName = 'number';
            } else if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
                typeName = 'boolean';
            } else if (node.kind === ts.SyntaxKind.NullKeyword) {
                typeName = 'null';
            } else {
                const detectType = this.resolver.getTypeAtLocation(node);
                typeName = this.getNameFromTypeNode(detectType);
            }

            if (typeName) {
                (<any>node).__return_type = typeName;
            }

            return typeName;
        } catch (e) {
            (<any>node).__return_type = 'error';
            try {
                console.warn('Can\'t get type of "' + node.getText() + '"');
            } catch (e2) {
                console.warn('Can\'t get type of autogen. <node>');
            }
        }

        return undefined;
    }

    public isResultFunctioinType(expression: ts.Expression) {
        const type = this.resolver.getTypeAtLocation(expression);
        const functionType = type
            && type.symbol
            && type.symbol.declarations
            && type.symbol.declarations[0]
            && (type.symbol.declarations[0].kind === ts.SyntaxKind.FunctionType);

        return functionType;
    }

    public isResultNonStaticMethodReference(expression: ts.Expression) {
        const type = this.resolver.getTypeAtLocation(expression);
        const nonStaticMethod = type
            && type.symbol
            && type.symbol.valueDeclaration
            && type.symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration
            && !(type.symbol.valueDeclaration.modifiers
                 && type.symbol.valueDeclaration.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword));

        return nonStaticMethod;
    }

    public isResultNonStaticMethodReferenceOrFunctionType(expression: ts.Expression) {
        const type = this.resolver.getTypeAtLocation(expression);
        const nonStaticMethod = type
            && type.symbol
            && type.symbol.valueDeclaration
            && type.symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration
            && !(type.symbol.valueDeclaration.modifiers
                 && type.symbol.valueDeclaration.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword));
        if (nonStaticMethod) {
            return true;
        }

        const functionType = type
            && type.symbol
            && type.symbol.declarations
            && type.symbol.declarations[0]
            && (type.symbol.declarations[0].kind === ts.SyntaxKind.FunctionType);

        return functionType;
    }
}
