import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Objects', () => {

    // TODO: javascript new object is not supported for now
    it.skip('new', () => expect('Doe\r\n').to.equals(new Run().test([
        'function Person(first, last, age, eyecolor) {                      \
            this.firstName = first;                                         \
            this.lastName = last;                                           \
            this.age = age;                                                 \
            this.eyeColor = eyecolor;                                       \
        }                                                                   \
        var myFather = new Person("John", "Doe", 50, "blue");               \
        var myMother = new Person("Sally", "Rally", 48, "green");           \
        console.log(myFather.lastName)                                      \
    '])));

    it.skip('new class', () => expect('const\r\nHi\r\n').to.equals(new Run().test([
        'function Class1() {                                                \
            console.log("const");                                           \
        }                                                                   \
                                                                            \
        Class1.prototype.sayHi = function () {                              \
            console.log("Hi");                                              \
        };                                                                  \
                                                                            \
        let c = new Class1();                                               \
        c.sayHi();                                                          \
    '])));

    it('object - spread assignment', () => expect('0\r\nfalse\r\n').to.equals(new Run().test([
        'let options = {                                                    \
            b1: false                                                       \
        };                                                                  \
                                                                            \
        let mergedOptions = {                                               \
            bilinearFiltering: false,                                       \
            comparisonFunction: 0,                                          \
            generateStencil: false,                                         \
            ...options                                                      \
        };                                                                  \
                                                                            \
        console.log(mergedOptions.comparisonFunction);                      \
        console.log(mergedOptions.b1);                                      \
    '])));

    // '{}' carries '__index'/'__newindex', but they are inert until the table is made its own
    // metatable - without that, a missing key read back as lua 'nil' rather than 'undefined'
    it('an empty object literal reads a missing key as undefined', () => expect(new Run().test([
        'class undefined {}                                                 \
        const o: { [key: string]: number } = {};                            \
        console.log(o["missing"] === undefined);                            \
        console.log(o["missing"] !== undefined);                            \
        console.log(o["missing"] === null);                                 \
        o["a"] = 1;                                                         \
        console.log(o["a"] !== undefined);                                  \
    '])).to.equals('true\r\nfalse\r\nfalse\r\ntrue\r\n'));

    // the same metatable is what routes a null assignment into the '__nulls' holder, so that
    // 'null' survives a round trip instead of erasing the key
    it('an empty object literal keeps a null apart from a missing key', () => expect(new Run().test([
        'class undefined {}                                                 \
        const o: { [key: string]: number } = {};                            \
        o["n"] = null;                                                      \
        console.log(o["n"] === null);                                       \
        console.log(o["n"] === undefined);                                  \
    '])).to.equals('true\r\nfalse\r\n'));
});
