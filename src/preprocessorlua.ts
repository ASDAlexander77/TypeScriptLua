import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { TypeInfo } from './typeInfo';

export class PreprocessorLua {

    public constructor(private resolver: IdentifierResolver, private typeInfo: TypeInfo) {
    }

    public preprocessStatement(node: ts.Statement): ts.Statement {
        if (!node) {
            throw new Error('node is null or undefined');
        }

        return node;
    }

    public preprocessExpression(node: ts.Expression): ts.Expression {
        if (!node) {
            throw new Error('node is null or undefined');
        }

        let newExpression: ts.Expression;
        switch (node.kind) {
            case ts.SyntaxKind.NewExpression:
                newExpression = this.preprocessNewExpression(<ts.NewExpression>node);
                break;

            case ts.SyntaxKind.CallExpression:
                newExpression = this.preprocessCallExpression(<ts.CallExpression>node);
                break;

            case ts.SyntaxKind.PropertyAccessExpression:
                newExpression = this.preprocessPropertyAccessExpression(<ts.PropertyAccessExpression>node);
                break;

            case ts.SyntaxKind.ElementAccessExpression:
                newExpression = this.preprocessElementAccessExpression(<ts.ElementAccessExpression>node);
                break;

            case ts.SyntaxKind.TypeAssertionExpression:
                newExpression = this.preprocessTypeAssertionExpression(<ts.TypeAssertion>node);
                break;
        }

        if (newExpression) {
            return newExpression;
        }

        return node;
    }

    private preprocessNewExpression(newExpression: ts.NewExpression): ts.Expression {

        if (newExpression.arguments.length === 0) {
            return;
        }

        const methodDelc = this.typeInfo.getTypeObject(newExpression.expression);
        const constructs = methodDelc
            && methodDelc.symbol
            && methodDelc.symbol.valueDeclaration
            && methodDelc.symbol.valueDeclaration.members.filter(m => m.kind === ts.SyntaxKind.Constructor);
        const parameters = constructs && constructs.length > 0 && constructs[0].parameters;

        const newArgs = <any>this.preprocessCallParameters(newExpression.arguments, parameters);
        if (newArgs) {
            newExpression.arguments = newArgs;
        }

        return undefined;
    }

    private preprocessCallExpression(callExpression: ts.CallExpression): ts.Expression {

        // String -> tostring, Number -> tonumber
        if (callExpression.expression.kind === ts.SyntaxKind.Identifier && callExpression.arguments.length === 1) {
            const name = callExpression.expression.kind === ts.SyntaxKind.Identifier ? (<ts.Identifier>callExpression.expression).text : '';
            if (name === 'String' || name === 'Number') {
                const identExpr = ts.createIdentifier('to' + name.toLowerCase());
                identExpr.parent = callExpression.expression.parent;
                callExpression.expression = identExpr;
            }
        }

        // preprocess method paremeters when const string cast to String object required
        this.preprocessMethodCallParameters(callExpression);

        if (callExpression.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {

            const newExpression =
                this.preprocessBindingApplyingOrCalling(callExpression)
                || this.preprocessConstCast(callExpression);

            if (newExpression) {
                return newExpression;
            }
        }

        this.preprocessSuperCalls(callExpression);

        return undefined;
    }

    // we need to convert all method returns (such as <THIS>.<METHOD>)
    // into __wrapper(this, method) to be able to call method without providing <THIS>
    private preprocessPropertyAccessExpression(propertyAccessExpression: ts.PropertyAccessExpression): ts.Expression {
        if (propertyAccessExpression.parent
            && (propertyAccessExpression.parent.kind === ts.SyntaxKind.VariableDeclaration
                || propertyAccessExpression.parent.kind === ts.SyntaxKind.PropertyDeclaration
                || propertyAccessExpression.parent.kind === ts.SyntaxKind.BinaryExpression
                || propertyAccessExpression.parent.kind === ts.SyntaxKind.CallExpression)) {

            const isRightOfBinaryExpression =
                propertyAccessExpression.parent.kind === ts.SyntaxKind.BinaryExpression
                && (<ts.BinaryExpression>propertyAccessExpression.parent).operatorToken.kind === ts.SyntaxKind.EqualsToken
                && (<ts.BinaryExpression>propertyAccessExpression.parent).right === propertyAccessExpression;

            const isCallParameter =
                propertyAccessExpression.parent.kind === ts.SyntaxKind.CallExpression
                && (<ts.CallExpression>propertyAccessExpression.parent).expression !== propertyAccessExpression;

            const declar =
                propertyAccessExpression.parent.kind === ts.SyntaxKind.VariableDeclaration
                || propertyAccessExpression.parent.kind === ts.SyntaxKind.PropertyDeclaration;

            // in case of getting method
            if ((isRightOfBinaryExpression || isCallParameter || declar)
                /*&& this.typeInfo.isResultNonStaticMethodReference(propertyAccessExpression)*/
                && this.typeInfo.isResultMethodReference(propertyAccessExpression)
                && !(<any>propertyAccessExpression).__self_call_required) {
                // wrap it into method
                (<any>propertyAccessExpression).__self_call_required = true;
                const methodWrapCall = ts.createCall(ts.createIdentifier('__wrapper'), undefined, [propertyAccessExpression, propertyAccessExpression.expression]);
                methodWrapCall.parent = propertyAccessExpression.parent;
                return methodWrapCall;
            } else if (this.typeInfo.isResultFunctioinType(propertyAccessExpression)) {
                // propertyAccessExpression2.parent.kind === ts.SyntaxKind.CallExpression
                // suppress SELF calls
                (<any>propertyAccessExpression).__self_call_required = false;
            }
        }

        if (this.typeInfo.isTypeOfNode(propertyAccessExpression.expression, 'string')
            && propertyAccessExpression.name.text === 'length'
            && !(<any>propertyAccessExpression.name).__len) {
            const getLengthOfString = ts.createCall(
                ts.createPropertyAccess(
                    ts.createIdentifier('StringHelper'), 'getLength'), undefined, [propertyAccessExpression.expression]);
            getLengthOfString.parent = propertyAccessExpression.parent;
            return getLengthOfString;
        }

        // replace <XXX>.prototype  to <XXX>.__proto
        if (propertyAccessExpression.name.text === 'prototype') {

            // if access object is Type then prototype is Type thus access to prototype object should be removed
            const exprTypeInfo = this.typeInfo.getVariableDeclarationOfTypeOfNode(propertyAccessExpression.expression);
            if (exprTypeInfo && exprTypeInfo.kind === ts.SyntaxKind.ClassDeclaration) {
                return propertyAccessExpression.expression;
            }

            // otherwise rename it into __proto
            const protoIdentifier = ts.createIdentifier('__proto');
            protoIdentifier.parent = propertyAccessExpression.name.parent;
            propertyAccessExpression.name = protoIdentifier;
        }

        return undefined;
    }

    private preprocessTypeAssertionExpression(typeAssertion: ts.TypeAssertion): ts.Expression {

        if (this.typeInfo.isTypeOfNode(typeAssertion.type, 'string') && !this.typeInfo.isTypeOfNode(typeAssertion.expression, 'string')) {
            const castExpr = ts.createCall(
                ts.createIdentifier('tostring'),
                undefined,
                [typeAssertion.expression]);
            castExpr.parent = typeAssertion.parent;
            return castExpr;
        }

        if (this.typeInfo.isTypeOfNode(typeAssertion.type, 'number') && !this.typeInfo.isTypeOfNode(typeAssertion.expression, 'number')) {
            const castExpr = ts.createCall(
                ts.createIdentifier('tonumber'),
                undefined,
                [typeAssertion.expression]);
            castExpr.parent = typeAssertion.parent;
            return castExpr;
        }

        return typeAssertion;
    }

    private preprocessElementAccessExpression(elementAccessExpression: ts.ElementAccessExpression): ts.Expression {
        // support string access  'asd'[xxx];

        const isConstStringAndNumberElementAccess =
            this.typeInfo.isTypeOfNode(elementAccessExpression.expression, 'string')
            && this.typeInfo.isTypeOfNode(elementAccessExpression.argumentExpression, 'number');
        if (!isConstStringAndNumberElementAccess) {
            return undefined;
        }

        const stringIdent = ts.createIdentifier('string');
        const charIdent = ts.createIdentifier('char');
        const byteIdent = ts.createIdentifier('byte');

        const decrIndex = ts.createBinary(
            elementAccessExpression.argumentExpression, ts.SyntaxKind.PlusToken, ts.createNumericLiteral('1'));
        const getByteExpr = ts.createCall(ts.createPropertyAccess(stringIdent, byteIdent), undefined,
            [
                elementAccessExpression.expression,
                decrIndex
            ]);

        decrIndex.parent = getByteExpr;

        const expr = ts.createCall(
            ts.createPropertyAccess(stringIdent, charIdent),
            undefined,
            [getByteExpr]);

        expr.parent = elementAccessExpression.parent;
        getByteExpr.parent = expr;

        return expr;
    }

    // BIND
    // convert <xxx>.bind(this) into __bind(<xxx>, this, ...); +apply, +call
    // check if end propertyaccess is 'bind'
    private preprocessBindingApplyingOrCalling(callExpression: ts.CallExpression): ts.Expression {
        const propertyAccessExpression = <ts.PropertyAccessExpression>callExpression.expression;

        const propertyName = propertyAccessExpression.name.text;
        const isBindCallOfMethod =
            (propertyName === 'bind' || propertyName === 'apply' || propertyName === 'call')
            && this.typeInfo.isResultMethodReferenceOrFunctionTypeOrAny(propertyAccessExpression.expression);
        if (!isBindCallOfMethod) {
            return undefined;
        }

        const methodBindCall = ts.createCall(
            ts.createIdentifier('__' + propertyAccessExpression.name.text),
            undefined,
            [propertyAccessExpression.expression, ...callExpression.arguments]);
        // do not use METHOD as parent, otherwise processCallExpression will mess up with return pareneters
        methodBindCall.parent = propertyAccessExpression.parent.parent;
        (<any>methodBindCall).__bind_call = true;
        return methodBindCall;
    }

    private preprocessConstCast(callExpression: ts.CallExpression) {
        const propertyAccessExpression = <ts.PropertyAccessExpression>callExpression.expression;

        // STRING & NUMBER
        // string "...".<function>()  => new String("...").<function>()
        let isConstString = propertyAccessExpression.expression.kind === ts.SyntaxKind.StringLiteral;
        let isConstNumber = propertyAccessExpression.expression.kind === ts.SyntaxKind.NumericLiteral;
        if (!isConstString && !isConstNumber) {
            try {
                const typeResult = this.typeInfo.getTypeObject(propertyAccessExpression.expression);
                if (typeResult) {
                    isConstString = (typeResult.intrinsicName || typeof (typeResult.value)) === 'string';
                    isConstNumber = (typeResult.intrinsicName || typeof (typeResult.value)) === 'number';
                }
            } catch (e) {
                console.warn('Can\'t get type of "' + callExpression.getText() + '"');
            }
        }

        if (isConstString || isConstNumber) {
            const methodCall = ts.createCall(
                ts.createPropertyAccess(
                    ts.createIdentifier(
                        isConstString ? 'StringHelper' : (isConstNumber ? 'NumberHelper' : '')), propertyAccessExpression.name),
                undefined,
                [propertyAccessExpression.expression, ...callExpression.arguments]);
            methodCall.parent = callExpression;
            return methodCall;
        }
    }

    private preprocessSuperCalls(callExpression: ts.CallExpression) {
        let memberAccess = callExpression.expression;

        // SUPER
        // convert super.xxx(...) into <Type>.xxx(this, ...);
        let lastPropertyAccess: ts.PropertyAccessExpression;
        while (memberAccess.kind === ts.SyntaxKind.PropertyAccessExpression) {
            lastPropertyAccess = <ts.PropertyAccessExpression>memberAccess;
            memberAccess = lastPropertyAccess.expression;
        }

        if (memberAccess.kind === ts.SyntaxKind.SuperKeyword) {
            (<any>callExpression.expression).__self_call_required = false;
            // add 'this' parameter
            callExpression.arguments = <ts.NodeArray<ts.Expression>><any>[ts.createThis(), ...callExpression.arguments];
        }
    }

    private preprocessMethodCallParameters(callExpression: ts.CallExpression) {
        if (callExpression.arguments.length === 0) {
            return;
        }

        const methodDelc = this.typeInfo.getTypeObject(callExpression.expression);
        const parameters = methodDelc
            && methodDelc.symbol
            && methodDelc.symbol.valueDeclaration
            && methodDelc.symbol.valueDeclaration.parameters;

        const newArgs = <any>this.preprocessCallParameters(callExpression.arguments, parameters);
        if (newArgs) {
            callExpression.arguments = newArgs;
        }
    }

    private preprocessCallParameters(
        args: ts.NodeArray<ts.Expression>,
        parameters: ts.NodeArray<ts.ParameterDeclaration>): ts.Expression[] {
        if (!args || args.length === 0) {
            return null;
        }

        if (!parameters || parameters.length === 0) {
            return null;
        }

        const newArguments = new Array<ts.Expression>();

        const length = args.length;
        let anyNewArgument = false;
        for (let i = 0; i < length; i++) {
            let currentOrNewArgument = args[i];
            const parameter = parameters[i];
            if (!parameter || parameter.dotDotDotToken) {
                continue;
            }

            let typeOfParameter = parameter.type;
            if (typeOfParameter
                && typeOfParameter.kind === ts.SyntaxKind.ArrayType
                && parameter.dotDotDotToken
                && parameter.dotDotDotToken.kind === ts.SyntaxKind.DotDotDotToken) {
                typeOfParameter = (<ts.ArrayTypeNode>typeOfParameter).elementType;
            }

            // if paraneter is NULL treaqt it as "custom code which is not required correction, for example rowget(t, '__get__')"

            // case 'Any'
            const any = typeOfParameter && typeOfParameter.kind === ts.SyntaxKind.AnyKeyword;
            if (any) {
                // if string
                const typeName = this.typeInfo.getTypeNameOfNode(currentOrNewArgument);
                switch (typeName) {
                    case 'string':
                        const identString = ts.createIdentifier('String');
                        const newString = ts.createNew(identString, undefined, [ currentOrNewArgument ]);
                        newString.parent = currentOrNewArgument.parent;
                        identString.parent = newString;
                        currentOrNewArgument = newString;
                        anyNewArgument = true;
                        break;
                    case 'number':
                        const identNumber = ts.createIdentifier('Number');
                        const newNumber = ts.createNew(identNumber, undefined, [ currentOrNewArgument ]);
                        newNumber.parent = currentOrNewArgument.parent;
                        identNumber.parent = newNumber;
                        currentOrNewArgument = newNumber;
                        anyNewArgument = true;
                        break;
                    case '__object':
                        // we need to have Dynamic object which converts all const values such as string into String classes
                        // and numbers into Number classes as 'any' can't tell us which type we are using
                        const identObject = ts.createIdentifier('Object');
                        const newObject = ts.createNew(identObject, undefined, [ currentOrNewArgument ]);
                        newObject.parent = currentOrNewArgument.parent;
                        identObject.parent = newObject;
                        currentOrNewArgument = newObject;
                        anyNewArgument = true;
                        break;
                }
            }

            // case 'string'
            const stringConstType = typeOfParameter && typeOfParameter.kind === ts.SyntaxKind.StringKeyword;
            if (stringConstType) {
                // if string
                const typeName = this.typeInfo.getTypeNameOfNode(currentOrNewArgument);
                switch (typeName) {
                    case 'string':
                    case '__function':
                        // nothing to do
                        break;
                    case 'any':
                    default:
                        const ident = ts.createIdentifier('__tostring');
                        const tostringCall = ts.createCall(ident, undefined, [ currentOrNewArgument ]);
                        ident.parent = tostringCall;
                        tostringCall.parent = currentOrNewArgument.parent;
                        currentOrNewArgument = tostringCall;
                        anyNewArgument = true;
                        break;
                }
            }

            const numberConstType = parameter.type && parameter.type.kind === ts.SyntaxKind.NumberKeyword;
            if (numberConstType) {
                // if string
                const typeName = this.typeInfo.getTypeNameOfNode(currentOrNewArgument);
                switch (typeName) {
                    case 'number':
                    case '__function':
                        // nothing to do
                        break;
                    case 'any':
                    default:
                        const ident = ts.createIdentifier('tonumber');
                        const tonumberCall = ts.createCall(ident, undefined, [ currentOrNewArgument ]);
                        ident.parent = tonumberCall;
                        tonumberCall.parent = currentOrNewArgument.parent;
                        currentOrNewArgument = tonumberCall;
                        anyNewArgument = true;
                        break;
                }
            }

            if (!currentOrNewArgument) {
                throw Error('current argument is undefined/null');
            }

            newArguments.push(currentOrNewArgument);
        }

        if (anyNewArgument) {
            return newArguments;
        }

        return null;
    }
}
