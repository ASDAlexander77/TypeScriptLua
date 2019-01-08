import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { TypeInfo } from './typeInfo';

export class Preprocessor {

    public constructor(private resolver: IdentifierResolver, private typeInfo: TypeInfo) {
    }

    public preprocessStatement(node: ts.Statement): ts.Statement {
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
        let newExpression: ts.Expression;
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression:
                newExpression = this.preprocessCallExpression(<ts.CallExpression>node);
                break;

            case ts.SyntaxKind.ConditionalExpression:
                newExpression = this.preprocessConditionalExpression(<ts.ConditionalExpression>node);
                break;

            case ts.SyntaxKind.PropertyAccessExpression:
                newExpression = this.preprocessPropertyAccessExpression(<ts.PropertyAccessExpression>node);
                break;

            case ts.SyntaxKind.ElementAccessExpression:
                newExpression = this.preprocessElementAccessExpression(<ts.ElementAccessExpression>node);
                break;
        }

        if (newExpression) {
            return newExpression;
        }

        return node;
    }

    private preprocessWhileDoIf(node: ts.Statement) {
        const expressionStatement = <any>node;
        if (this.typeInfo.isTypeOfNode(expressionStatement.expression, 'number')) {
            const newCondition = ts.createBinary(expressionStatement.expression, ts.SyntaxKind.BarBarToken, ts.createFalse());
            newCondition.parent = expressionStatement.expression.parent;
            expressionStatement.expression = newCondition;
        }
    }

    private preprocessConditionalExpression(conditionStatement: ts.ConditionalExpression): ts.Expression {
        if (this.typeInfo.isTypeOfNode(conditionStatement.condition, 'number')) {
            const newCondition = ts.createBinary(conditionStatement.condition, ts.SyntaxKind.BarBarToken, ts.createFalse());
            newCondition.parent = conditionStatement;
            conditionStatement.condition = newCondition;
        }

        return undefined;
    }

    private preprocessCallExpression(callExpression: ts.CallExpression): ts.Expression {
        // BIND
        // convert <xxx>.bind(this) into __bind(<xxx>, this, ...);
        // check if end propertyaccess is 'bind'
        let memberAccess = callExpression.expression;
        if (memberAccess.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccessExpression = <ts.PropertyAccessExpression>memberAccess;
            if (propertyAccessExpression.name.text === 'bind'
                && this.typeInfo.isResultNonStaticMethodReference(propertyAccessExpression.expression)) {
                const methodBindCall = ts.createCall(
                    ts.createIdentifier('__bind'),
                    undefined,
                    [ propertyAccessExpression.expression, ...callExpression.arguments ]);
                // do not use METHOD as parent, otherwise processCallExpression will mess up with return pareneters
                methodBindCall.parent = propertyAccessExpression.parent.parent;
                (<any>methodBindCall).__bind_call = true;
                return methodBindCall;
            }

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
                            isConstString
                                ? 'StringHelper'
                                : (isConstNumber ? 'NumberHelper' : '')),
                        (<ts.PropertyAccessExpression>memberAccess).name),
                    undefined,
                    [(<ts.PropertyAccessExpression>memberAccess).expression, ...callExpression.arguments]);
                methodCall.parent = callExpression;
                return methodCall;
            }
        }

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
                const methodWrapCall = ts.createCall(ts.createIdentifier('__wrapper'), undefined, [ propertyAccessExpression ]);
                methodWrapCall.parent = propertyAccessExpression.parent;
                return methodWrapCall;
            } else if (this.typeInfo.isResultFunctioinType(propertyAccessExpression)) {
                // propertyAccessExpression2.parent.kind === ts.SyntaxKind.CallExpression
                // suppress SELF calls
                (<any>propertyAccessExpression).__self_call_required = false;
            }
        }

        // replace <XXX>.prototype  to <XXX>.__proto
        if (propertyAccessExpression.name.text === 'prototype') {
            const protoIdentifier = ts.createIdentifier('__proto');
            protoIdentifier.parent = propertyAccessExpression.name.parent;
            propertyAccessExpression.name = protoIdentifier;
        }

        return undefined;
    }

    private preprocessElementAccessExpression(elementAccessExpression: ts.ElementAccessExpression): ts.Expression {
        // support string access  'asd'[xxx];

        const isConstStringOrNumber =
            this.typeInfo.isTypeOfNode(elementAccessExpression.expression, 'string')
            && this.typeInfo.isTypeOfNode(elementAccessExpression.argumentExpression, 'number');
        if (!isConstStringOrNumber) {
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
            [ getByteExpr ]);

        expr.parent = elementAccessExpression.parent;
        getByteExpr.parent = expr;

        return expr;
    }
}
