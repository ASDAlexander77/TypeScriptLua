import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('emitted preamble', () => {

    // '__new' raises when its prototype is nil. building an Error to do so re-entered '__new'
    // with the same nil prototype - and 'Error' is not a global in the emitted lua anyway, so
    // the guard recursed until the stack blew instead of reporting anything
    it('the __new prototype guard does not re-enter __new', () => {
        const lua = new Run().testEmit(['class C {} const c = new C();']);
        expect(lua).to.contain('error("Prototype');
        expect(lua).to.not.contain('error(__new(Error');
    });

    it('the __new prototype guard does not re-enter __new, with jslib', () => {
        const lua = new Run().testEmit(['class C {} const c = new C();'], { jslib: true });
        expect(lua).to.contain('error("Prototype');
        expect(lua).to.not.contain('error(__new(Error');
    });

});
