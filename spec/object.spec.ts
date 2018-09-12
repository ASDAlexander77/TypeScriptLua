import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Objects', () => {

    // TODO: javascript new object is not support for now
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

});
