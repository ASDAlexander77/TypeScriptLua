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

    // the declaration the name of a property access resolves to, so its modifiers can be inspected.
    // the type of '<class>.<member>' is the same for a static member and for a member of an instance,
    // the 'static' modifier can only be read from the declaration itself
    public getMemberDeclaration(node: ts.Node) {
        const declaration = this.getSymbolValueDeclaration(node);
        if (declaration) {
            return declaration;
        }

        const type = this.getTypeObject(node);
        return type && type.symbol && type.symbol.valueDeclaration;
    }

    // '<instance>.<static member>' is not resolved by the type checker, as it is not valid TypeScript, while in Lua
    // it does reach the member, the class table being the prototype of its instances. the declaration can still be
    // found by looking the name up among the static members of the class of the instance and of its base classes
    public getStaticMemberDeclarationOfInstance(expression: ts.Expression, name: ts.Node) {
        const memberName = (<ts.Identifier>name).text;
        if (!memberName) {
            return undefined;
        }

        // a class extending itself through a type alias would loop forever otherwise
        const visited = new Set<ts.Node>();
        let classDeclaration = this.getClassDeclarationOfNode(expression);
        while (classDeclaration && !visited.has(classDeclaration)) {
            visited.add(classDeclaration);

            const member = classDeclaration.members.find(m => m.name
                && (<ts.Identifier>m.name).text === memberName
                && m.modifiers
                && m.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword));
            if (member) {
                return member;
            }

            classDeclaration = this.getBaseClassDeclaration(classDeclaration);
        }

        return undefined;
    }

    private getClassDeclarationOfNode(node: ts.Node): ts.ClassLikeDeclaration {
        const type = this.getTypeObject(this.skipOuterExpressions(node));
        const declaration = type && type.symbol && type.symbol.valueDeclaration;
        return declaration
            && (declaration.kind === ts.SyntaxKind.ClassDeclaration || declaration.kind === ts.SyntaxKind.ClassExpression)
            ? <ts.ClassLikeDeclaration>declaration
            : undefined;
    }

    private getBaseClassDeclaration(classDeclaration: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration {
        const extendsClause = classDeclaration.heritageClauses
            && classDeclaration.heritageClauses.find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
        const baseExpression = extendsClause && extendsClause.types[0] && extendsClause.types[0].expression;
        return baseExpression ? this.getClassDeclarationOfNode(baseExpression) : undefined;
    }

    // a cast or a pair of parentheses hides the class of the instance, while the value behind it is the same object
    private skipOuterExpressions(node: ts.Node): ts.Node {
        while (node
            && (node.kind === ts.SyntaxKind.ParenthesizedExpression
                || node.kind === ts.SyntaxKind.AsExpression
                || node.kind === ts.SyntaxKind.TypeAssertionExpression
                || node.kind === ts.SyntaxKind.NonNullExpression)) {
            node = (<ts.ParenthesizedExpression>node).expression;
        }

        return node;
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

    // 'declare var os: any' is how a native Lua library is brought into scope. those are plain tables of
    // functions and a call on them must not pass 'self', while an 'any' coming from anywhere else (a parameter,
    // a cast, an untyped property) can still hold a real object whose methods do expect 'self'.
    // only an ambient *variable* qualifies - an ambient property or method typed 'any' says nothing about
    // the value it holds
    public isAmbientVariable(expression: ts.Expression) {
        const declaration = this.getSymbolValueDeclaration(expression);
        if (!declaration || declaration.kind !== ts.SyntaxKind.VariableDeclaration) {
            return false;
        }

        // the 'declare' modifier sits on the variable statement, not on the declaration itself
        for (let node: ts.Node = declaration; node; node = node.parent) {
            if (node.kind === ts.SyntaxKind.SourceFile) {
                return (<ts.SourceFile>node).isDeclarationFile;
            }

            if (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DeclareKeyword)) {
                return true;
            }
        }

        return false;
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

    // a static method is emitted without 'this' as its first parameter, so a reference to it must
    // not be wrapped into '__wrapper' - the wrapper prepends the object and shifts every argument.
    // the exception is a static method using 'this', which does keep 'this' as its first parameter
    public isResultStaticMethodReferenceWithoutThis(expression: ts.Expression) {
        const type = this.getTypeObject(expression);
        const declaration = type && type.symbol && type.symbol.valueDeclaration;

        return declaration
            && declaration.kind === ts.SyntaxKind.MethodDeclaration
            && declaration.modifiers
            && declaration.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword)
            && !Helpers.hasNodeUsedThis(declaration);
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
