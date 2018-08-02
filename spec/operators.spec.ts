import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Arithmetic Operators', () => {

    it('Binary', () => expect('7\r\n3\r\n10\r\n2.5\r\n1\r\n7\r\n3\r\n10\r\n2.5\r\n1\r\n').to.equals(new Run().test([
        'var x, y;                                  \
        y = 5;                                      \
        x = y + 2;	                                \
        console.log(x);                             \
        x = y - 2;	                                \
        console.log(x);                             \
        x = y * 2;	                                \
        console.log(x);                             \
        x = y / 2;	                                \
        console.log(x);                             \
        x = y % 2;	                                \
        console.log(x);                             \
        let x2, y2;                                 \
        y2 = 5;                                     \
        x2 = y2 + 2;	                            \
        console.log(x2);                            \
        x2 = y2 - 2;	                            \
        console.log(x2);                            \
        x2 = y2 * 2;	                            \
        console.log(x2);                            \
        x2 = y2 / 2;	                            \
        console.log(x2);                            \
        x2 = y2 % 2;	                            \
        console.log(x2);                            \
    '])));

    it.skip('String', () => expect('Good Morning\r\n').to.equals(new Run().test([
        'let text1, text2, text3;                   \
        text1 = "Good ";                            \
        text2 = "Morning";                          \
        text3 = text1 + text2;                      \
        console.log(text3);                         \
    '])));

    it('Bitwise', () => expect('1\r\n5\r\n-6\r\n4\r\n10\r\n2\r\n').to.equals(new Run().test([
        'let x;                                     \
        x = 5 & 1;                                  \
        console.log(x);                             \
        x = 5 | 1;                                  \
        console.log(x);                             \
        x = ~ 5;                                    \
        console.log(x);                             \
        x = 5 ^ 1;                                  \
        console.log(x);                             \
        x = 5 << 1;                                 \
        console.log(x);                             \
        x = 5 >> 1;                                 \
        console.log(x);                             \
    '])));

});
