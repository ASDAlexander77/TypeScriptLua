import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('If', () => {

    it('simple If', () => expect('works\r\n').to.equals(new Run().test([
        'let a = true;                              \
        if (a) console.log("works");                \
    '])));

    it('simple If/else', () => expect('works\r\n').to.equals(new Run().test([
        'let a = true;                                         \
        if (!a) console.log("no"); else console.log("works");  \
    '])));

    it('simple If/if-else/else', () => expect('works\r\n').to.equals(new Run().test([
        'let a = true;                                                                          \
        if (!a) console.log("no"); else if (a) console.log("works"); else console.log("end.");  \
    '])));
});
