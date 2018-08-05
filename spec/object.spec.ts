import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Objects', () => {

    it('new', () => expect('Doe\r\n').to.equals(new Run().test([
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

});
