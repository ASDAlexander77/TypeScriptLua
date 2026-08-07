// The vendored tests were written for the MLIR TypeScript compiler. Three things differ
// here, and each is patched onto a copy - the vendored file is never touched. See
// docs/superpowers/specs/2026-08-07-jslib-conformance-suite-design.md.

export interface TransformedTest {
    // compiled by tsc-lua and executed by lua.exe
    lua: string;
    // executed by 'node --experimental-strip-types'
    node: string;
}

// './JS' is a Lua module, so this goes on the lua side alone
const JS_IMPORT = 'import \'./JS\';\n';

// prepended to BOTH sides, so an assertion behaves identically in each
const ASSERT_SHIM = [
    'function assert(condition: any, message?: string): void {',
    '    if (!condition) {',
    '        throw new Error(\'assertion failed\' + (message ? \': \' + message : \'\'));',
    '    }',
    '}',
    ''
].join('\n');

// 'assert(' not preceded by a dot or word character, so 'chai.assert(' would not count
const CALLS_ASSERT = /(^|[^.\w])assert\s*\(/;
const DEFINES_ASSERT = /(function\s+assert\s*\(|(?:const|let|var)\s+assert\s*=)/;

const DECLARES_MAIN = /(^|\n)\s*(?:async\s+)?function\s+main\s*\(/;
// a call sits at the start of a statement; the 'function main(' declaration cannot match,
// because 'main' there is preceded by 'function ' rather than by a statement boundary
const CALLS_MAIN = /(^|\n|;|\})\s*main\s*\(\s*\)/;

export function transform(source: string): TransformedTest {
    let body = source;

    if (CALLS_ASSERT.test(body) && !DEFINES_ASSERT.test(body)) {
        body = ASSERT_SHIM + body;
    }

    if (DECLARES_MAIN.test(body) && !CALLS_MAIN.test(body)) {
        body = body + '\nmain();\n';
    }

    return { lua: JS_IMPORT + body, node: body };
}
