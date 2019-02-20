import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { TypeInfo } from './typeInfo';

export class Preprocessor {

    public disablePreprocessing: boolean;

    public constructor(private resolver: IdentifierResolver, private typeInfo: TypeInfo) {
    }

    public preprocessStatement(node: ts.Statement): ts.Statement {
        if (!node) {
            throw new Error('node is null or undefined');
        }

        if (this.disablePreprocessing) {
            return node;
        }

        switch (node.kind) {
            case ts.SyntaxKind.WhileStatement:
            case ts.SyntaxKind.DoStatement:
            case ts.SyntaxKind.IfStatement:
                this.preprocessWhileDoIf(node);
                break;
        }

        return node;
    }

    public preprocessExpression(node: ts.Expression): ts.Expression {
        if (!node) {
            throw new Error('node is null or undefined');
        }

        if (this.disablePreprocessing) {
            return node;
        }

        let newExpression: ts.Expression;
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression:
                newExpression = this.preprocessCallExpression(<ts.CallExpression>node);
                break;

            case ts.SyntaxKind.ConditionalExpression:
                newExpression = this.preprocessConditionalExpression(<ts.ConditionalExpression>node);
                break;

            case ts.SyntaxKind.PrefixUnaryExpression:
                if ((<ts.PrefixUnaryExpression>node).operator === ts.SyntaxKind.ExclamationToken) {
                    newExpression = this.preprocessNotExpression(<ts.PrefixUnaryExpression>node);
                }

                break;

            case ts.SyntaxKind.BinaryExpression:
                if ((<ts.BinaryExpression>node).operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken
                     || (<ts.BinaryExpression>node).operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken) {
                    newExpression = this.preprocessEqualsEqualsOrNotEqualsExpression(<ts.BinaryExpression>node);
                }

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

    private preprocessWhileDoIf(node: ts.Statement) {
        const expressionStatement = <any>node;

        if (expressionStatement.expression.kind === ts.SyntaxKind.PrefixUnaryExpression) {
            const prefixUnaryExpression = <ts.PrefixUnaryExpression>expressionStatement.expression;
            // skip case if (!<xxx>)
            if (prefixUnaryExpression.operator === ts.SyntaxKind.ExclamationToken) {
                return;
            }
        }

        const newCondition = ts.createBinary(expressionStatement.expression, ts.SyntaxKind.BarBarToken, ts.createFalse());
        newCondition.parent = expressionStatement.expression.parent;
        expressionStatement.expression = newCondition;
    }

    private preprocessConditionalExpression(conditionStatement: ts.ConditionalExpression): ts.Expression {

        if ((<any>conditionStatement).__no_preprocess) {
            return;
        }

        const newCondition = ts.createBinary(conditionStatement.condition, ts.SyntaxKind.BarBarToken, ts.createFalse());
        newCondition.parent = conditionStatement;
        conditionStatement.condition = newCondition;

        return undefined;
    }

    private preprocessNotExpression(prefixUnaryExpression: ts.PrefixUnaryExpression): ts.Expression {
        const newCondition = ts.createBinary(prefixUnaryExpression.operand, ts.SyntaxKind.BarBarToken, ts.createFalse());
        newCondition.parent = prefixUnaryExpression;
        prefixUnaryExpression.operand = <ts.UnaryExpression><any>newCondition;

        return undefined;
    }

    private preprocessEqualsEqualsOrNotEqualsExpression(binaryExpression: ts.BinaryExpression): ts.Expression {
       const left = ts.createBinary(binaryExpression.left, ts.SyntaxKind.BarBarToken, ts.createNull());
        left.parent = binaryExpression;
        (<any>left).__undefined_only = true;
        binaryExpression.left = <ts.UnaryExpression><any>left;

        const right = ts.createBinary(binaryExpression.right, ts.SyntaxKind.BarBarToken, ts.createNull());
        right.parent = binaryExpression;
        (<any>right).__undefined_only = true;
        binaryExpression.right = <ts.UnaryExpression><any>right;

        return undefined;
    }

    private preprocessCallExpression(callExpression: ts.CallExpression): ts.Expression {

        // preprocess method paremeters when const string cast to String object required
        this.preprocessMethodCallParameters(callExpression);

        if (callExpression.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {

            const newExpression =
                this.preprocessBinding(callExpression)
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
                propertyAccessExpression.parent.kind === ts.SyntaxKind.VariableDeclaration;

            // in case of getting method
            if ((isRightOfBinaryExpression || isCallParameter || declar)
                && this.typeInfo.isResultNonStaticMethodReference(propertyAccessExpression)
                && !(<any>propertyAccessExpression).__self_call_required) {
                // wrap it into method
                (<any>propertyAccessExpression).__self_call_required = true;
                const methodWrapCall = ts.createCall(ts.createIdentifier('__wrapper'), undefined, [propertyAccessExpression]);
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
    // convert <xxx>.bind(this) into __bind(<xxx>, this, ...);
    // check if end propertyaccess is 'bind'
    private preprocessBinding(callExpression: ts.CallExpression): ts.Expression {
        const propertyAccessExpression = <ts.PropertyAccessExpression>callExpression.expression;

        const isBindCallOfMethod =
            propertyAccessExpression.name.text === 'bind'
            && this.typeInfo.isResultNonStaticMethodReferenceOrFunctionType(propertyAccessExpression.expression);
        if (!isBindCallOfMethod) {
            return undefined;
        }

        const methodBindCall = ts.createCall(
            ts.createIdentifier('__bind'),
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
                const typeResult = this.resolver.getTypeAtLocation(propertyAccessExpression.expression);
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
            // add 'this' parameter
            callExpression.arguments = <ts.NodeArray<ts.Expression>><any>[ts.createThis(), ...callExpression.arguments];
        }
    }

    private preprocessMethodCallParameters(callExpression: ts.CallExpression) {
        if (callExpression.arguments.length === 0) {
            return;
        }

        const newArguments = new Array<ts.Expression>();

        const methodDelc = this.resolver.getTypeAtLocation(callExpression.expression);
        const parameters = methodDelc
            && methodDelc.symbol
            && methodDelc.symbol.valueDeclaration
            && methodDelc.symbol.valueDeclaration.parameters;

        const length = callExpression.arguments.length;
        let anyNewArgument = false;
        for (let i = 0; i < length; i++) {
            let currentOrNewArgument = callExpression.arguments[i];
            const parameter = parameters && parameters[i];
            // if paraneter is NULL treaqt it as "custom code which is not required correction, for example rowget(t, '__get__')"

            // case 'Any'
            const any = parameter && parameter.type && parameter.type.kind === ts.SyntaxKind.AnyKeyword;
            if (any) {
                // if string
                const typeName = this.typeInfo.getTypeOfNode(currentOrNewArgument);
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
                }
            }

            // case 'string'
            const stringConstType = parameter && parameter.type && parameter.type.kind === ts.SyntaxKind.StringKeyword;
            if (stringConstType) {
                // if string
                const typeName = this.typeInfo.getTypeOfNode(currentOrNewArgument);
                switch (typeName) {
                    case 'string':
                    case '__function':
                        // nothing to do
                        break;
                    case 'any':
                    default:
                        const ident = ts.createIdentifier('tostring');
                        const tostringCall = ts.createCall(ident, undefined, [ currentOrNewArgument ]);
                        ident.parent = tostringCall;
                        tostringCall.parent = currentOrNewArgument.parent;
                        currentOrNewArgument = tostringCall;
                        anyNewArgument = true;
                        break;
                }
            }

            const numberConstType = parameter && parameter.type && parameter.type.kind === ts.SyntaxKind.NumberKeyword;
            if (numberConstType) {
                // if string
                const typeName = this.typeInfo.getTypeOfNode(currentOrNewArgument);
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
            callExpression.arguments = <any>newArguments;
        }
    }
}
