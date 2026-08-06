import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('JSLib', () => {

    // jslib's Math is a table of plain functions taking no self - 'Math = { floor = function (op) ... }'
    // in JS.lua - so a self call would pass the Math table itself as the first argument
    it('Math: a static call is emitted with a dot', () => {
        const lua = new Run().testEmit(['console.log(Math.floor(1.5));'], { jslib: true });
        expect(lua).to.contain('Math.floor(');
        expect(lua).to.not.contain('Math:floor(');
    });

    // the same problem, and the one the hardcoded 'Math' special case never covered:
    // lib.es5.d.ts models String as a variable of an interface type, so 'fromCharCode' resolves
    // to a MethodSignature, which 'isStaticMethod' rejects
    it('String: a static call is emitted with a dot', () => {
        const lua = new Run().testEmit(['console.log(String.fromCharCode(65));'], { jslib: true });
        expect(lua).to.contain('String.fromCharCode(');
        expect(lua).to.not.contain('String:fromCharCode(');
    });

    // without -jslib, lib.es5.d.ts declares 'Math' as a variable of an interface type, so
    // 'floor' resolves to a MethodSignature and the fallback in processPropertyAccessExpression
    // is the only thing keeping this a dot call - JS.lua's Math table takes no self
    it('Math: a static call is emitted with a dot, without jslib', () => {
        const lua = new Run().testEmit(['console.log(Math.floor(1.5));']);
        expect(lua).to.contain('Math.floor(');
        expect(lua).to.not.contain('Math:floor(');
    });

});
