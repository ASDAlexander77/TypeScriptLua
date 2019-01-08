import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';

export class TypeInfo {

    public constructor(private resolver: IdentifierResolver) {
    }

    public isTypeOfNode(node: ts.Node, typeName: string) {
        return this.getTypeOfNode(node) === typeName;
    }

    public getTypeOfNode(node: ts.Node) {
        if (!node) {
            return undefined;
        }

        if ((<any>node).__return_type) {
            return (<any>node).__return_type;
        }

        try {
            const detectType = this.resolver.getTypeAtLocation(node);
            (<any>node).__return_type =
                detectType.intrinsicName && detectType.intrinsicName !== 'unknown'
                    ? detectType.intrinsicName
                    : detectType.value
                        ? typeof(detectType.value)
                        : undefined;
            return (<any>node).__return_type;
        } catch (e) {
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
