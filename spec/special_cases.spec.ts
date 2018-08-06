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

    it('Or in assignments(local) 3', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        function f() {                          \
            return 1;                           \
        }                                       \
                                                \
        a = b || f();                           \
                                                \
        console.log(a);                         \
    '])));

    it('Or in assignments(local) 4', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b = 1;                              \
                                                \
        function f() {                          \
            let s = null;                       \
            s();                                \
            return 2;                           \
        }                                       \
                                                \
        a = b || f();                           \
                                                \
        console.log(a);                         \
    '])));

});
