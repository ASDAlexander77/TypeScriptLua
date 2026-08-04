import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { Helpers } from './helpers';

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

    public getNameFromTypeNode(detectType: any): string | undefined {
        if (!detectType)
            return undefined;

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

        // if __return_type present but __return_variable_type_declaration is not, it means that declaration is class and thus 'this' call is going to be static method
        return (<any>node).__return_variable_type_declaration;
    }

    // '<container>[<key>] = <value>' is the only place where the type of an element of an untyped container can be
    // seen, as the type checker returns 'error' type for an index access without an index signature.
    // remember it on the declaration of the container, so a later 'const v = <container>[<key>]' can pick it up
    public saveElementTypeOfContainer(elementAccess: ts.ElementAccessExpression, elementType: ts.TypeNode) {
        const containerDeclaration = this.getSymbolValueDeclaration(elementAccess.expression);
        if (!containerDeclaration || (<any>containerDeclaration).__element_type !== undefined) {
            return;
        }

        (<any>containerDeclaration).__element_type = elementType;
    }

    // counterpart of 'saveElementTypeOfContainer', marks the declaration with the type saved by an earlier assignment.
    // the type is kept in '__element_type' and not in 'declaration.type', as setting a real type annotation on a node
    // makes the type checker resolve it and return the type of the constructor ('ArrayConstructor' instead of 'Array')
    public restoreElementTypeOfContainer(declaration: ts.VariableDeclaration, elementAccess: ts.ElementAccessExpression) {
        const containerDeclaration = this.getSymbolValueDeclaration(elementAccess.expression);
        if (containerDeclaration && (<any>containerDeclaration).__element_type !== undefined) {
            (<any>declaration).__element_type = (<any>containerDeclaration).__element_type;
        }
    }

    public getSymbolValueDeclaration(node: ts.Node) {
        const symbol = this.resolver.getSymbolAtLocation(node);
        if (symbol && symbol.valueDeclaration) {
            return symbol.valueDeclaration;
        }

        return undefined;
    }

    public getTypeObject(node: ts.Node) {
        let detectType = this.resolver.getTypeAtLocation(node);
        detectType = this.UnwrapUnionType(detectType);

        if (!detectType || detectType && detectType.intrinsicName === 'error') {
            // fallback scenario
            const symbol = this.resolver.getSymbolAtLocation(node);
            if (symbol) {
                if (symbol.valueDeclaration)
                {
                    if (symbol.valueDeclaration.type || symbol.valueDeclaration.__element_type) {
                        detectType = symbol.valueDeclaration;
                    }
                    else for (const nodeTypeHolder of [symbol.valueDeclaration, symbol.valueDeclaration.initializer]) {
                        if (nodeTypeHolder)
                        {
                            detectType = this.resolver.getTypeAtLocation(nodeTypeHolder) || nodeTypeHolder;
                            detectType = this.UnwrapUnionType(detectType);
                            if (detectType && detectType.intrinsicName !== 'error') {
                                break;
                            }
                        }
                    }

                    return detectType;
                }
                else
                {
                    return symbol.declarations && symbol.declarations[0] ? symbol.declarations[0] : undefined;
                }
            }
        }

        return detectType;
    }

    private UnwrapUnionType(detectType: any) {
        if (detectType && detectType.types && detectType.types[0]) {
            // if unit type, just select first one
            const unionTypes = detectType.types;
            detectType = unionTypes[0];
            if (detectType
                && unionTypes
                && unionTypes.length > 1
                && (detectType.intrinsicName === 'error'
                    || detectType.intrinsicName === 'undefined'
                    || detectType.intrinsicName === 'null')) {
                // use next type in case of error or undefined type
                detectType = unionTypes[1];
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
                if (typeName && detectType.symbol && detectType.symbol.valueDeclaration) {
                    (<any>node).__return_variable_type_declaration = detectType.symbol.valueDeclaration;
                }
            }

            if (typeName && typeName != 'error') {
                (<any>node).__return_type = typeName;
            }

            return typeName;
        } catch (e) {
            (<any>node).__return_type = 'error';
            console.warn(Helpers.getNodeLocation(node)
                + ': warning: can\'t get type of "' + Helpers.getNodeText(node, 'autogen. <node>') + '"');
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

    public isImportType(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
        const importType = type
            && type.symbol
            && type.symbol.declarations
            && type.symbol.declarations[0]
            && (type.symbol.declarations[0].kind === ts.SyntaxKind.ImportClause);

        return importType;
    }

    public isResultMethodReference(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
        const nonStaticMethod = type
            && type.symbol
            && type.symbol.valueDeclaration
            && (type.symbol.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration
                || type.symbol.valueDeclaration.kind === ts.SyntaxKind.ArrowFunction);

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
