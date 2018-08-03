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

    it.skip('var access variables within other functions 2', () => expect('2\r\n').to.equals(new Run().test([
        'function f() {                         \
            var a = 1;                          \
                                                \
            a = 2;                              \
            var b = g();                        \
            a = 3;                              \
                                                \
            return b;                           \
                                                \
            function g() {                      \
                return a;                       \
            }                                   \
        }                                       \
                                                \
        console.write(f());                     \
    '])));

    it('var Re-declarations and Shadowing', () => expect('1\r\n').to.equals(new Run().test([
        'function f(x:any) {                    \
            var x:any;                          \
            var x:any = 1;                      \
            console.log(x);                     \
        }                                       \
        f(20);                                  \
    '])));

    it('const declarations', () => expect('Cat\r\n').to.equals(new Run().test([
        'const numLivesForCat = 9;              \
        const kitty = {                         \
            name: "Aurora",                     \
            numLives: numLivesForCat,           \
        }                                       \
                                                \
        kitty.name = "Rory";                    \
        kitty.name = "Kitty";                   \
        kitty.name = "Cat";                     \
        console.log(kitty.name);                \
    '])));

});
