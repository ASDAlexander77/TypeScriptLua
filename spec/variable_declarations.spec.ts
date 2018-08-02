import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Variable Declarations', () => {

    it('var', () => expect('10\r\n').to.equals(new Run().test([
        'var a = 10;                            \
        console.log(a);                         \
    '])));

    it('var in function', () => expect('Hello, world!\r\n').to.equals(new Run().test([
        'function f() {                         \
            var message = "Hello, world!";      \
            return message;                     \
        }                                       \
        console.log(f());                       \
    '])));

    it('var access variables within other functions', () => expect('11\r\n').to.equals(new Run().test([
        'function f() {                         \
            var a = 10;                         \
            return function g() {               \
                var b = a + 1;                  \
                return b;                       \
            }                                   \
        }                                       \
                                                \
        var g = f();                            \
        console.log(g());                       \
    '])));

    it('var Re-declarations and Shadowing', () => expect('1\r\n').to.equals(new Run().test([
        'function f(x:any) {                    \
            var x:any;                          \
            var x:any = 1;                      \
            console.log(x);                     \
        }                                       \
        f(20);                                  \
    '])));


});
