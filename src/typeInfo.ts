import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';

export class TypeInfo {

    public constructor(private resolver: IdentifierResolver) {
    }

    public isTypeOfNode(node: ts.Node, typeName: string) {
        return this.getTypeNameOfNode(node) === typeName;
    }

    public isTypesOfNode(node: ts.Node, typeNames: string[]) {
        const res = this.getTypeNameOfNode(node);
        return typeNames.some(t => t === res);
    }

    public getNameFromTypeNode(detectType: any): string {
        const val =
            detectType.intrinsicName && detectType.intrinsicName !== 'unknown'
            ? detectType.intrinsicName
            : detectType.value !== undefined
                ? typeof (detectType.value)
                : this.getTypeNameFromKind(<ts.Node>detectType)
                    ? this.getTypeNameFromKind(<ts.Node>detectType)
                    : detectType.symbol
                        ? detectType.symbol.name
                        : detectType.target && (detectType.target.objectFlags & ts.ObjectFlags.Tuple) === ts.ObjectFlags.Tuple
                            ? 'tuple'
                            : (detectType.objectFlags & ts.ObjectFlags.Anonymous) === ts.ObjectFlags.Anonymous
                                ? 'anonymous'
                                : undefined;

        return val;
    }

    public getTypeNameFromKind(node: ts.Node) {
        let typeName;
        if (node.kind === ts.SyntaxKind.StringLiteral) {
            typeName = 'string';
        } else if (node.kind === ts.SyntaxKind.NumericLiteral) {
            typeName = 'number';
        } else if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
            typeName = 'boolean';
        } else if (node.kind === ts.SyntaxKind.NullKeyword) {
            typeName = 'null';
        }

        return typeName;
    }

    public getVariableDeclarationOfTypeOfNode(node: ts.Node) {
        if ((<any>node).__return_variable_type_declaration) {
            return (<any>node).__return_variable_type_declaration;
        }

        this.getTypeNameOfNode(node);
        return (<any>node).__return_variable_type_declaration;
    }

    public getTypeObject(node: ts.Node) {
        let detectType = this.resolver.getTypeAtLocation(node);
        if (detectType && detectType.types && detectType.types[0]) {
            // if unit type, just select first one
            detectType = detectType.types[0];
        }

        if (!detectType || detectType && detectType.intrinsicName === 'error') {
            // fallback scenario
            const symbol = this.resolver.getSymbolAtLocation(node);
            if (symbol && symbol.valueDeclaration && symbol.valueDeclaration.initializer) {
                detectType = this.resolver.getTypeAtLocation(symbol.valueDeclaration.initializer);
                if (detectType && detectType.types && detectType.types[0]) {
                    // if unit type, just select first one
                    detectType = detectType.types[0];
                }

                return detectType;
            }
        }

        return detectType;
    }

    public getTypeNameOfNode(node: ts.Node) {
        if (!node) {
            return undefined;
        }

        if ((<any>node).__return_type) {
            return (<any>node).__return_type;
        }

        try {
            let typeName = this.getTypeNameFromKind(node);
            if (!typeName) {
                const detectType = this.getTypeObject(node);
                typeName = this.getNameFromTypeNode(detectType);
                if (typeName && detectType.symbol) {
                    (<any>node).__return_variable_type_declaration = detectType.symbol.valueDeclaration;
                }
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
        const type = this.getTypeObject(expression);
        const functionType = type
            && type.symbol
            && type.symbol.declarations
            && type.symbol.declarations[0]
            && (type.symbol.declarations[0].kind === ts.SyntaxKind.FunctionType);

        return functionType;
    }

    public isResultMethodReference(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
        const nonStaticMethod = type
            && type.symbol
            && type.symbol.valueDeclaration
            && type.symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration;

        return nonStaticMethod;
    }

    public isResultNonStaticMethodReference(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
        const nonStaticMethod = type
            && type.symbol
            && type.symbol.valueDeclaration
            && type.symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration
            && !(type.symbol.valueDeclaration.modifiers
                 && type.symbol.valueDeclaration.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword));

        return nonStaticMethod;
    }

    public isResultMethodReferenceOrFunctionType(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
        const nonStaticMethod = type
            && type.symbol
            && type.symbol.valueDeclaration
            && type.symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration;
        if (nonStaticMethod) {
            return true;
        }

        const functionType = type
            && type.symbol
            && type.symbol.declarations
            && type.symbol.declarations[0]
            && (type.symbol.declarations[0].kind === ts.SyntaxKind.FunctionType
                || type.symbol.declarations[0].kind === ts.SyntaxKind.TypeParameter);

        return functionType;
    }

    public isResultMethodReferenceOrFunctionTypeOrAny(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
        const nonStaticMethod = type
            && type.symbol
            && type.symbol.valueDeclaration
            && type.symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration;
        if (nonStaticMethod) {
            return true;
        }

        if (this.getNameFromTypeNode(type) === 'any') {
            return true;
        }

        const functionType = type
            && type.symbol
            && type.symbol.declarations
            && type.symbol.declarations[0]
            && (type.symbol.declarations[0].kind === ts.SyntaxKind.FunctionType
                || type.symbol.declarations[0].kind === ts.SyntaxKind.TypeParameter);

        return functionType;
    }

    public isResultNonStaticMethodReferenceOrFunctionType(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
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
