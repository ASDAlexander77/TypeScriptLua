import { expect } from 'chai';
import { describe, it } from 'mocha';
import { runTest } from '../scripts/conformance/runner';

// each case spawns node twice plus tsc-lua plus lua.exe
const TIMEOUT = 120000;

describe('conformance runner', function () {
    this.timeout(TIMEOUT);

    it('reports MATCH when jslib agrees with node', () => {
        const result = runTest('agree', 'console.log("a dog".indexOf("dog"));');
        expect(result.category).to.equal('MATCH');
        expect(result.nodeStdout).to.equal('2');
    });

    it('reports DIFF when jslib disagrees with node', () => {
        // a non-global regex must replace only the first occurrence; jslib replaces both
        const result = runTest('disagree',
            'console.log("dog and dog".replace(/Dog/i, "cat"));');
        expect(result.category).to.equal('DIFF');
        expect(result.nodeStdout).to.equal('cat and dog');
        expect(result.luaStdout).to.not.equal(result.nodeStdout);
    });

    it('reports NONDET when node output is not reproducible', () => {
        const result = runTest('nondet', 'console.log(Date.now());');
        expect(result.category).to.equal('NONDET');
    });

    it('reports NODE_FAIL when the test does not run under node', () => {
        const result = runTest('nodefail', 'throw new Error("boom");');
        expect(result.category).to.equal('NODE_FAIL');
    });

    it('runs the assert shim on both sides', () => {
        const result = runTest('asserts', 'assert(1 === 1);\nconsole.log("ok");');
        expect(result.category).to.equal('MATCH');
        expect(result.nodeStdout).to.equal('ok');
    });

    it('preserves trailing whitespace instead of masking padEnd/padStart/trim defects', () => {
        // normalize() must only fold CRLF and trim the trailing blank line left by the
        // last print - stripping trailing whitespace from every line would turn a real
        // padEnd/padStart/trim defect into a false MATCH
        const result = runTest('trailing-whitespace', 'console.log("x".padEnd(5) + "|end");');
        expect(result.nodeStdout).to.equal('x    |end');
    });

});
