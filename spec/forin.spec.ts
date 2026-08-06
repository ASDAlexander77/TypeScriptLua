import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('for/in over an array', () => {

    // an array holds its elements in '_values', so 'pairs' on the array itself yields the single
    // key '_values' and never an element. the shape can not be settled statically - 'let a: any'
    // is still an array at runtime - so the source is picked at runtime, for every for/in
    it('picks the iteration source at runtime', () => {
        const lua = new Run().testEmit(['let a = [10, 20]; for (let i in a) { console.log(a[i]); }'],
            { jslib: true });
        expect(lua).to.contain('rawget(__c, "_values")');
        expect(lua).to.contain('pairs(__v or __c)');
    });

    it('picks the iteration source at runtime for an array typed any', () => {
        const lua = new Run().testEmit(
            ['let a: any = [10, 20]; for (let i in a) { console.log(a[i]); }'], { jslib: true });
        expect(lua).to.contain('rawget(__c, "_values")');
        expect(lua).to.contain('pairs(__v or __c)');
    });

    // the lua key over '_values' is 1 based, JS hands out a 0 based index - and 'a[i]' in the body
    // depends on it. a plain container keeps its key as-is
    it('shifts the key to the 0 based index JS hands out, only over an array', () => {
        const lua = new Run().testEmit(['let a = [10, 20]; for (let i in a) { console.log(a[i]); }'],
            { jslib: true });
        expect(lua).to.match(/local i\s*= __v and __k - 1 or __k/);
    });

    // '_values' carries the '__index'/'__newindex' hooks, so only its numeric keys are elements
    it('keeps only the numeric keys of the element storage', () => {
        const lua = new Run().testEmit(['let a = [10, 20]; for (let i in a) { console.log(a[i]); }'],
            { jslib: true });
        expect(lua).to.contain('__v and __type(__k) == "number"');
    });

    // without jslib an array is a plain 0 based table, so the same emission has to fall through to
    // the container branch rather than reach for a '_values' that is not there
    it('non-jslib arrays fall through to the container branch', () => {
        const lua = new Run().testEmit(['let a = [10, 20]; for (let i in a) { console.log(a[i]); }']);
        expect(lua).to.contain('pairs(__v or __c)');
        expect(lua).to.contain('rawget(__c, "_values")');
    });

});
