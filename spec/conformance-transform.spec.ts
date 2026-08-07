import { expect } from 'chai';
import { describe, it } from 'mocha';
import { transform } from '../scripts/conformance/transform';

describe('conformance transform', () => {

    it('adds the JS import to the lua side only', () => {
        const out = transform('console.log(1);');
        expect(out.lua).to.contain('import \'./JS\';');
        expect(out.node).to.not.contain('./JS');
    });

    it('adds an assert shim when the test calls assert', () => {
        const out = transform('assert(1 === 1);');
        expect(out.lua).to.contain('function assert(');
        expect(out.node).to.contain('function assert(');
    });

    it('does not add an assert shim when the test never calls assert', () => {
        const out = transform('console.log(1);');
        expect(out.lua).to.not.contain('function assert(');
    });

    it('does not add an assert shim when the test defines its own', () => {
        const out = transform('function assert(c: any) { }\nassert(true);');
        expect(out.lua.indexOf('function assert(')).to.equal(
            out.lua.lastIndexOf('function assert('));
    });

    it('appends a main() call when main is declared but never called', () => {
        const out = transform('function main() { console.log(1); }');
        expect(out.lua).to.contain('\nmain();');
        expect(out.node).to.contain('\nmain();');
    });

    it('does not append main() when the test already calls it', () => {
        const out = transform('function main() { }\nmain();');
        expect(out.node.match(/main\(\);/g).length).to.equal(1);
    });

    it('does not append main() when there is no main', () => {
        const out = transform('console.log(1);');
        expect(out.lua).to.not.contain('main();');
    });

    it('preserves the original body verbatim', () => {
        const body = 'const p = "a dog";\nconsole.log(p.indexOf("dog"));';
        expect(transform(body).node).to.contain(body);
    });

});
