import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('for/in over an array', () => {

    // under jslib an array is an object holding its elements in '_values', so 'pairs' on the array
    // itself yields the single key '_values' and never an element
    it('jslib: iterates the element storage, not the array object', () => {
        const lua = new Run().testEmit(['let a = [10, 20]; for (let i in a) { console.log(a[i]); }'],
            { jslib: true });
        expect(lua).to.contain('pairs(a._values)');
        expect(lua).to.not.contain('pairs(a)');
    });

    // the lua key is 1 based, JS hands out a 0 based index - and 'a[i]' in the body depends on it
    it('jslib: shifts the key to the 0 based index JS hands out', () => {
        const lua = new Run().testEmit(['let a = [10, 20]; for (let i in a) { console.log(a[i]); }'],
            { jslib: true });
        expect(lua).to.match(/local i\s*= __k - 1/);
    });

    // without jslib an array is a plain 0 based lua table with no '_values' to reach into
    it('non-jslib: iterates the table itself', () => {
        const lua = new Run().testEmit(['let a = [10, 20]; for (let i in a) { console.log(a[i]); }']);
        expect(lua).to.contain('pairs(a)');
        expect(lua).to.not.contain('_values');
    });

});
