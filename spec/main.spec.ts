import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Simple compile', () => {

    it('Hello World 1', async () => await new Run().test([
"                                       \
    var x:string = 'Hello World!';      \
    console.log(x);                     \
"], "test.luabc"));

});
