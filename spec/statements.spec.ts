import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Statements', () => {

    it('simple If', () => expect('works\r\n').to.equals(new Run().test([
        'let a = true;                              \
        if (a) console.log("works");                \
    '])));

    it('simple If/else', () => expect('works\r\n').to.equals(new Run().test([
        'let a = true;                                         \
        if (!a) console.log("no"); else console.log("works");  \
    '])));

    it('simple do/while', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'let a = 10;                                            \
        do {                                                    \
            a = a - 1;                                          \
            console.log(a);                                     \
        } while (a > 0);                                        \
    '])));
});
