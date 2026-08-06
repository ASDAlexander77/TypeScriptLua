import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';

// jslib splits each primitive across two classes: '<X>Helper' holds the operations working on the
// primitive value, '<X>' is the boxed object. TypeScript resolves the members of a primitive through
// a single global type of the matching name, so the helper is folded into the class.
// both classes of a pair must live in the same file - the printer needs one source file per node.
const HELPER_MERGE_MAP: { [helper: string]: string } = {
    'StringHelper': 'String',
    'NumberHelper': 'Number'
};

// lua metatable plumbing, never called from TypeScript
const METAMETHODS: { [name: string]: boolean } = {
    '__tostring': true, '__index': true, '__newindex': true, '__call': true, '__len': true,
    '__lt': true, '__le': true, '__add': true, '__sub': true, '__mul': true, '__div': true,
    '__unm': true, '__concat': true, '__eq': true
};

// 'declare class undefined' collides with the intrinsic 'undefined'
const EXCLUDED_CLASSES: { [name: string]: boolean } = { 'undefined': true };

interface CollectedClass {
    name: string;
    declaration: ts.ClassDeclaration;
}

interface CollectedAlias {
    name: string;
    declaration: ts.TypeAliasDeclaration;
}

export function generateJsLibDts(jslibDir: string): string {
    const fileNames = readIncludeList(jslibDir);
    const program = ts.createProgram(fileNames, {
        target: ts.ScriptTarget.ES2018,
        experimentalDecorators: true,
        skipLibCheck: true
    });

    const checker = program.getTypeChecker();
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    const parts: string[] = [
        '// GENERATED FILE - do not edit by hand.',
        '// Produced from experiments/jslib by \'npm run build-jslib-dts\'.',
        '',
        fs.readFileSync(path.join(jslibDir, 'core.prelude.d.ts'), 'utf8').trim(),
        ''
    ];

    for (const fileName of fileNames) {
        const sourceFile = program.getSourceFile(fileName);
        if (!sourceFile) {
            throw new Error('jslib source is missing: ' + fileName);
        }

        for (const text of emitSourceFile(sourceFile, checker, printer)) {
            parts.push(text, '');
        }
    }

    return parts.join('\n');
}

// the include list of the jslib tsconfig is the authority on which files make up the library,
// and its order is what makes regeneration byte for byte identical
function readIncludeList(jslibDir: string): string[] {
    const configPath = path.join(jslibDir, 'tsconfig.json');
    const config = ts.parseConfigFileTextToJson(configPath, fs.readFileSync(configPath, 'utf8'));
    if (config.error) {
        throw new Error('can\'t read ' + configPath + ': ' + config.error.messageText);
    }

    const include: string[] = config.config && config.config.include;
    if (!include || include.length === 0) {
        throw new Error('no \'include\' list in ' + configPath);
    }

    return include.map(f => path.join(jslibDir, f));
}

function emitSourceFile(sourceFile: ts.SourceFile, checker: ts.TypeChecker, printer: ts.Printer): string[] {
    const classes = collectClasses(sourceFile);
    const byName: { [name: string]: CollectedClass } = {};
    classes.forEach(c => byName[c.name] = c);

    const texts: string[] = [];

    // a type alias referenced by a kept member (e.g. 'FuncString' in String.replace) has to be
    // declared too, or the generated file does not resolve on its own - emitted ahead of the
    // classes so a member referencing it reads top-down
    texts.push(...emitTypeAliases(sourceFile, printer));

    for (const collected of classes) {
        // a helper (e.g. 'StringHelper') is also a global in its own right at runtime
        // ('StringHelper = { ... }' in JS.lua), so it is emitted as its own 'declare class'
        // in addition to being folded into its primitive
        const helperName = Object.keys(HELPER_MERGE_MAP).filter(h => HELPER_MERGE_MAP[h] === collected.name)[0];
        let foldedIn: ts.ClassElement[] = [];
        if (helperName) {
            const helper = byName[helperName];
            if (!helper) {
                throw new Error(helperName + ' is in the merge map but is not declared beside '
                    + collected.name + ' in ' + sourceFile.fileName);
            }

            foldedIn = transformMembers(helper.declaration, checker, true);
        }

        texts.push(printer.printNode(
            ts.EmitHint.Unspecified,
            transformClass(collected.declaration, foldedIn, checker),
            sourceFile));
    }

    texts.push(...emitFunctions(sourceFile, checker, printer));
    texts.push(...emitAssignedGlobals(sourceFile, printer));
    return texts;
}

// a class in 'module JS' / 'module TS' is emitted by the compiler as a global of its own name
// (see 'TS.Math = Math' in JS.lua), so the module wrapper is dropped here.
// a class at the top level of a file, like RegExp, is already a global
function collectClasses(sourceFile: ts.SourceFile): CollectedClass[] {
    const classes: CollectedClass[] = [];

    const visit = (node: ts.Node, insideModule: boolean) => {
        if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            const body = (<ts.ModuleDeclaration>node).body;
            if (body && body.kind === ts.SyntaxKind.ModuleBlock) {
                (<ts.ModuleBlock>body).statements.forEach(s => visit(s, true));
            }

            return;
        }

        if (node.kind !== ts.SyntaxKind.ClassDeclaration) {
            return;
        }

        const declaration = <ts.ClassDeclaration>node;
        const exported = declaration.modifiers
            && declaration.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!declaration.name || (insideModule && !exported)) {
            return;
        }

        if (EXCLUDED_CLASSES[declaration.name.text]) {
            return;
        }

        classes.push({ name: declaration.name.text, declaration });
    };

    sourceFile.statements.forEach(s => visit(s, false));
    return classes;
}

// a type alias in 'module JS' / 'module TS' is dropped along with the module wrapper, same as a
// class - unlike a class it need not be exported to be collected, since a member can keep a
// reference to a non-exported alias (e.g. 'FuncString' in String.ts) verbatim from the source
function collectTypeAliases(sourceFile: ts.SourceFile): CollectedAlias[] {
    const aliases: CollectedAlias[] = [];

    const visit = (node: ts.Node, insideModule: boolean) => {
        if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            const body = (<ts.ModuleDeclaration>node).body;
            if (body && body.kind === ts.SyntaxKind.ModuleBlock) {
                (<ts.ModuleBlock>body).statements.forEach(s => visit(s, true));
            }

            return;
        }

        if (node.kind !== ts.SyntaxKind.TypeAliasDeclaration) {
            return;
        }

        const declaration = <ts.TypeAliasDeclaration>node;
        aliases.push({ name: declaration.name.text, declaration });
    };

    sourceFile.statements.forEach(s => visit(s, false));
    return aliases;
}

function emitTypeAliases(sourceFile: ts.SourceFile, printer: ts.Printer): string[] {
    return collectTypeAliases(sourceFile).map(alias => printer.printNode(
        ts.EmitHint.Unspecified,
        ts.createTypeAliasDeclaration(
            undefined,
            [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
            alias.declaration.name,
            alias.declaration.typeParameters,
            alias.declaration.type),
        sourceFile));
}

function transformClass(
    declaration: ts.ClassDeclaration, foldedIn: ts.ClassElement[], checker: ts.TypeChecker): ts.ClassDeclaration {

    const members: ts.ClassElement[] = [];
    // a plain '{}' inherits 'constructor', 'toString' etc. from Object.prototype, which would make
    // 'taken[key]' true before a matching member is ever seen and silently drop it - jslib classes
    // declare both, so the dedup set must not have a prototype
    const taken: { [key: string]: boolean } = Object.create(null);

    // the folded in helper members go first, so on a name collision the helper wins: the merged
    // type is above all the apparent type of the primitive, and a primitive call is rewritten to
    // the helper at emit time, so the helper's 'string' is the accurate return type
    for (const member of foldedIn.concat(transformMembers(declaration, checker, false))) {
        const key = memberKey(member);
        if (taken[key]) {
            continue;
        }

        taken[key] = true;
        members.push(member);
    }

    return ts.createClassDeclaration(
        undefined,
        [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
        declaration.name,
        declaration.typeParameters,
        declaration.heritageClauses,
        members);
}

// static and instance names live in separate namespaces, so they key separately
function memberKey(member: ts.ClassElement): string {
    if (member.kind === ts.SyntaxKind.Constructor) {
        return 'constructor';
    }

    if (member.kind === ts.SyntaxKind.IndexSignature) {
        return 'index-signature';
    }

    const isStatic = member.modifiers
        && member.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword);
    return (isStatic ? 'static ' : '') + (<ts.Identifier>member.name).text;
}

function transformMembers(
    declaration: ts.ClassDeclaration, checker: ts.TypeChecker, folding: boolean): ts.ClassElement[] {

    const members: ts.ClassElement[] = [];
    const accessorGroups = collectAccessorGroups(declaration.members);
    const emittedAccessors: { [key: string]: boolean } = Object.create(null);

    for (const member of declaration.members) {
        // when folding a helper into its class only the members are wanted, not its constructor
        if (folding && member.kind === ts.SyntaxKind.Constructor) {
            continue;
        }

        if (member.kind === ts.SyntaxKind.GetAccessor || member.kind === ts.SyntaxKind.SetAccessor) {
            // a get/set pair collapses to one property, emitted once, at the position of
            // whichever accessor of the pair is encountered first
            const key = accessorKey(member);
            if (!emittedAccessors[key] && accessorGroups[key]) {
                emittedAccessors[key] = true;
                members.push(transformAccessorGroup(accessorGroups[key], checker));
            }

            continue;
        }

        const transformed = transformMember(member, checker, folding);
        if (transformed) {
            members.push(transformed);
        }
    }

    return members;
}

interface AccessorGroup {
    getter?: ts.GetAccessorDeclaration;
    setter?: ts.SetAccessorDeclaration;
}

// static and instance accessors live in separate namespaces, same as any other member
function accessorKey(member: ts.ClassElement): string {
    return (hasStaticModifier(member) ? 'static ' : '') + (<ts.Identifier>member.name).text;
}

function hasStaticModifier(member: ts.ClassElement): boolean {
    return !!(member.modifiers && member.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword));
}

// hidden accessors (R3: private/protected, metamethods) are left out of the groups entirely, so a
// pair with one private side loses only that side rather than the whole property
function collectAccessorGroups(members: ts.NodeArray<ts.ClassElement>): { [key: string]: AccessorGroup } {
    const groups: { [key: string]: AccessorGroup } = Object.create(null);

    for (const member of members) {
        if (member.kind !== ts.SyntaxKind.GetAccessor && member.kind !== ts.SyntaxKind.SetAccessor) {
            continue;
        }

        if (isHidden(member)) {
            continue;
        }

        const key = accessorKey(member);
        const group = groups[key] || (groups[key] = {});
        if (member.kind === ts.SyntaxKind.GetAccessor) {
            group.getter = <ts.GetAccessorDeclaration>member;
        } else {
            group.setter = <ts.SetAccessorDeclaration>member;
        }
    }

    return groups;
}

// the emitter's dot/colon decision does not involve properties, and a property is the honest
// shape for something read and written like 'array.length' - a getter alone makes it readonly,
// a setter (with or without a getter) makes it writable
function transformAccessorGroup(group: AccessorGroup, checker: ts.TypeChecker): ts.PropertyDeclaration {
    const representative = group.getter || group.setter;

    const modifiers: ts.Modifier[] = [];
    if (hasStaticModifier(representative)) {
        modifiers.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));
    }

    if (group.getter && !group.setter) {
        modifiers.push(ts.createModifier(ts.SyntaxKind.ReadonlyKeyword));
    }

    const type = group.getter
        ? (group.getter.type || inferReturnType(group.getter, checker))
        : (group.setter.parameters[0].type
            || typeToNode(checker.getTypeAtLocation(group.setter.parameters[0]), checker, group.setter.parameters[0]));

    return ts.createProperty(
        undefined,
        modifiers.length > 0 ? modifiers : undefined,
        representative.name,
        undefined,
        type,
        undefined);
}

// 'folding' means this member is being moved from a helper onto the class of its primitive:
// a 'this' first parameter makes it an instance member of that class, anything else stays static
function transformMember(
    member: ts.ClassElement, checker: ts.TypeChecker, folding: boolean): ts.ClassElement {

    if (isHidden(member)) {
        return undefined;
    }

    const takesThis = folding && hasThisParameter(member);

    switch (member.kind) {
        case ts.SyntaxKind.Constructor: {
            const ctor = <ts.ConstructorDeclaration>member;
            return ts.createConstructor(
                undefined, undefined, transformParameters(ctor.parameters, checker, false), undefined);
        }

        case ts.SyntaxKind.MethodDeclaration: {
            const method = <ts.MethodDeclaration>member;
            return ts.createMethod(
                undefined,
                keepModifiers(member, takesThis),
                undefined,
                method.name,
                method.questionToken,
                method.typeParameters,
                transformParameters(method.parameters, checker, takesThis),
                method.type || inferReturnType(method, checker),
                undefined);
        }

        case ts.SyntaxKind.PropertyDeclaration: {
            const property = <ts.PropertyDeclaration>member;
            return ts.createProperty(
                undefined,
                keepModifiers(member, false),
                property.name,
                property.questionToken,
                property.type || typeToNode(checker.getTypeAtLocation(property), checker, property),
                undefined);
        }

        case ts.SyntaxKind.IndexSignature:
            return member;

        default:
            return undefined;
    }
}

function isHidden(member: ts.ClassElement): boolean {
    const hiddenByModifier = member.modifiers
        && member.modifiers.some(m => m.kind === ts.SyntaxKind.PrivateKeyword
            || m.kind === ts.SyntaxKind.ProtectedKeyword);
    if (hiddenByModifier) {
        return true;
    }

    const name = member.name && (<ts.Identifier>member.name).text;
    return !!name && METAMETHODS[name] === true;
}

function hasThisParameter(member: ts.ClassElement): boolean {
    const parameters = (<ts.MethodDeclaration>member).parameters;
    return !!(parameters && parameters.length > 0 && (<ts.Identifier>parameters[0].name).text === 'this');
}

// 'public' and 'export' say nothing in a declaration file; 'static', 'readonly' and 'abstract' do.
// a helper member folded onto the class of its primitive becomes an instance member, so it loses 'static'
function keepModifiers(member: ts.ClassElement, dropStatic: boolean): ts.Modifier[] {
    if (!member.modifiers) {
        return undefined;
    }

    const kept = member.modifiers
        .filter(m => (m.kind === ts.SyntaxKind.StaticKeyword && !dropStatic)
            || m.kind === ts.SyntaxKind.ReadonlyKeyword
            || m.kind === ts.SyntaxKind.AbstractKeyword)
        .map(m => ts.createModifier(<any>m.kind));

    return kept.length > 0 ? kept : undefined;
}

function transformParameters(
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
    checker: ts.TypeChecker,
    dropThisParameter: boolean): ts.ParameterDeclaration[] {

    const result: ts.ParameterDeclaration[] = [];

    parameters.forEach((parameter, index) => {
        if (dropThisParameter && index === 0 && (<ts.Identifier>parameter.name).text === 'this') {
            return;
        }

        // a parameter property ('constructor(private x: T)') is a plain parameter in a declaration,
        // and a default value becomes '?' - a declaration carries no initializer to fall back on.
        // a rest parameter is already optional and cannot take the token
        const optional = parameter.dotDotDotToken
            ? undefined
            : parameter.questionToken
                || (parameter.initializer ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined);

        result.push(ts.createParameter(
            undefined,
            undefined,
            parameter.dotDotDotToken,
            parameter.name,
            optional,
            parameter.type || typeToNode(checker.getTypeAtLocation(parameter), checker, parameter),
            undefined));
    });

    return result;
}

// a member without a type annotation still needs one in a declaration file. literal types are
// widened, so 'static readonly UNSENT = 0' becomes 'number' rather than '0'
function typeToNode(type: ts.Type, checker: ts.TypeChecker, location: ts.Node): ts.TypeNode {
    if (!type) {
        return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }

    const node = checker.typeToTypeNode(
        checker.getBaseTypeOfLiteralType(type), location, ts.NodeBuilderFlags.NoTruncation);
    return node || ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}

function inferReturnType(declaration: ts.SignatureDeclaration, checker: ts.TypeChecker): ts.TypeNode {
    const signature = checker.getSignatureFromDeclaration(declaration);
    return signature
        ? typeToNode(checker.getReturnTypeOfSignature(signature), checker, declaration)
        : ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}

// a plain top level function is part of the library - 'parseInt' and friends come from Common.ts.
// an ambient one, 'declare function setmetatable', names a lua native and is not JS API
function emitFunctions(sourceFile: ts.SourceFile, checker: ts.TypeChecker, printer: ts.Printer): string[] {
    const texts: string[] = [];

    for (const statement of sourceFile.statements) {
        if (statement.kind !== ts.SyntaxKind.FunctionDeclaration || isAmbient(statement)) {
            continue;
        }

        const fn = <ts.FunctionDeclaration>statement;
        if (!fn.name) {
            continue;
        }

        texts.push(printer.printNode(
            ts.EmitHint.Unspecified,
            ts.createFunctionDeclaration(
                undefined,
                [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
                undefined,
                fn.name,
                fn.typeParameters,
                transformParameters(fn.parameters, checker, false),
                fn.type || inferReturnType(fn, checker),
                undefined),
            sourceFile));
    }

    return texts;
}

// 'declare var console: any' followed by 'console = JS.Console' is how jslib publishes a global
// object, and the assignment is what says which type it really holds. an ambient variable which
// is never assigned is a lua native and stays out
function emitAssignedGlobals(sourceFile: ts.SourceFile, printer: ts.Printer): string[] {

    const assignedTo: { [name: string]: ts.Expression } = {};
    for (const statement of sourceFile.statements) {
        if (statement.kind !== ts.SyntaxKind.ExpressionStatement) {
            continue;
        }

        const expression = (<ts.ExpressionStatement>statement).expression;
        if (expression.kind !== ts.SyntaxKind.BinaryExpression) {
            continue;
        }

        const binary = <ts.BinaryExpression>expression;
        if (binary.operatorToken.kind === ts.SyntaxKind.EqualsToken
            && binary.left.kind === ts.SyntaxKind.Identifier) {
            assignedTo[(<ts.Identifier>binary.left).text] = binary.right;
        }
    }

    const texts: string[] = [];

    for (const statement of sourceFile.statements) {
        if (statement.kind !== ts.SyntaxKind.VariableStatement || !isAmbient(statement)) {
            continue;
        }

        for (const declaration of (<ts.VariableStatement>statement).declarationList.declarations) {
            const name = (<ts.Identifier>declaration.name).text;
            const value = assignedTo[name];
            if (!value) {
                continue;
            }

            texts.push(printer.printNode(
                ts.EmitHint.Unspecified,
                ts.createVariableStatement(
                    [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
                    ts.createVariableDeclarationList(
                        [ts.createVariableDeclaration(declaration.name, assignedTypeNode(value), undefined)],
                        ts.NodeFlags.None)),
                sourceFile));
        }
    }

    return texts;
}

// the right hand side names the class being published, and the module qualifier is dropped along
// with the module itself: 'console = JS.Console' is 'declare var console: typeof Console'.
// asking the checker for this type would print it back as 'typeof JS.Console', which no longer resolves
function assignedTypeNode(value: ts.Expression): ts.TypeNode {
    if (value.kind === ts.SyntaxKind.PropertyAccessExpression) {
        // jslib never uses '#private' access, so 'name' is always a plain identifier here
        return ts.createTypeQueryNode(<ts.Identifier>(<ts.PropertyAccessExpression>value).name);
    }

    if (value.kind === ts.SyntaxKind.Identifier) {
        return ts.createTypeQueryNode(<ts.Identifier>value);
    }

    return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}

function isAmbient(node: ts.Node): boolean {
    return !!(node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DeclareKeyword));
}
