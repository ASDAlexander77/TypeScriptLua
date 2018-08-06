import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Special cases', () => {

    it('Multiple assignments(local)', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        a = b = 1;                              \
                                                \
        console.log(a);                         \
    '])));

    it('Multiple assignments(global)', () => expect('1\r\n').to.equals(new Run().test([
        'var a;                                 \
        var b;                                  \
                                                \
        a = b = 1;                              \
                                                \
        console.log(a);                         \
    '])));

    it('Or in assignments(local)', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        a = b || 1;                             \
                                                \
        console.log(a);                         \
    '])));

    it('Or in assignments(local) 2', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        a = (b || (b = 1));                     \
                                                \
        console.log(a);                         \
    '])));

});
