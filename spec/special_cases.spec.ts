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

    it('++/-- prefix/suffix (local)', () => expect('2\r\n1\r\n1\r\n2\r\n').to.equals(new Run().test([
        'let a = 1;                             \
        console.log(++a);                       \
        console.log(--a);                       \
        console.log(a++);                       \
        console.log(a--);                       \
    '])));

    it('++/-- prefix/suffix (global)', () => expect('2\r\n1\r\n1\r\n2\r\n').to.equals(new Run().test([
        'var a = 1;                             \
        console.log(++a);                       \
        console.log(--a);                       \
        console.log(a++);                       \
        console.log(a--);                       \
    '])));

    it('chain of = (local)', () => expect('1\r\n1\r\n1\r\n').to.equals(new Run().test([
        'let a, b, c;                         \
        a = b = c = 1;                        \
        console.log(a);                       \
        console.log(b);                       \
        console.log(c);                       \
    '])));

    it('chain of = (global)', () => expect('1\r\n1\r\n1\r\n').to.equals(new Run().test([
        'var a, b, c;                         \
        a = b = c = 1;                        \
        console.log(a);                       \
        console.log(b);                       \
        console.log(c);                       \
    '])));

    it('chain of = (local)', () => expect('1\r\n').to.equals(new Run().test([
        'let a = 0, b = 1;                    \
        console.log(a += b);                  \
    '])));

    it('chain of = (global)', () => expect('1\r\n').to.equals(new Run().test([
        'let a = 0, b = 1;                    \
        console.log(a += b);                  \
    '])));

    it('? : (local)', () => expect('2\r\n').to.equals(new Run().test([
        'let a = 0, b = 1;                    \
        console.log(a > 0 ? b : 2);           \
    '])));

    it('? : (global)', () => expect('2\r\n').to.equals(new Run().test([
        'var a = 0, b = 1;                    \
        console.log(a > 0 ? b : 2);           \
    '])));

    it('= || : (local)', () => expect('test\r\n').to.equals(new Run().test([
        'let a;                                           \
        console.log((a = a || { name: "test" }).name;     \
    '])));

});
