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

    it('simple do/while (local)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'let a = 10;                                            \
        do {                                                    \
            a = a - 1;                                          \
            console.log(a);                                     \
        } while (a > 0);                                        \
    '])));

    it('simple do/while (global)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'var a = 10;                                            \
        do {                                                    \
            a = a - 1;                                          \
            console.log(a);                                     \
        } while (a > 0);                                        \
    '])));

    it('simple while (local)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'let a = 10;                                            \
        while (a > 0) {                                         \
            a = a - 1;                                          \
            console.log(a);                                     \
        };                                                      \
    '])));

    it('simple while (global)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'var a = 10;                                            \
        while (a > 0) {                                         \
            a = a - 1;                                          \
            console.log(a);                                     \
        };                                                      \
    '])));

    it('simple for (local)', () => expect('0\r\n1\r\n2\r\n3\r\n4\r\n').to.equals(new Run().test([
        'let i;                                                 \
        for (i = 0; i < 5; i++) {                               \
            console.log(i);                                     \
        }                                                       \
    '])));

    it('simple for (global)', () => expect('0\r\n1\r\n2\r\n3\r\n4\r\n').to.equals(new Run().test([
        'var i;                                                 \
        for (i = 0; i < 5; i++) {                               \
            console.log(i);                                     \
        }                                                       \
    '])));

    it('simple for/in (local) <LUA order>', () => expect('2\r\n3\r\n1\r\n').to.equals(new Run().test([
        '    let vals = [1, 2, 3];                              \
        let i;                                                  \
        for (i in vals) {                                       \
            console.log(vals[i]);                               \
        }                                                       \
    '])));

    it.skip('simple for/in (local) 2', () => expect('John Doe 25\r\n').to.equals(new Run().test([
        'let person = {fname:"John", lname:"Doe", age:25};      \
                                                                \
        let text = "";                                          \
        let x;                                                  \
        for (x in person) {                                     \
            text += person[x] + " ";                            \
        }                                                       \
        console.log(text);                                      \
    '])));

    it.skip('simple for/in (global) 2', () => expect('John Doe 25\r\n').to.equals(new Run().test([
        'var person = {fname:"John", lname:"Doe", age:25};      \
                                                                \
        var text = "";                                          \
        var x;                                                  \
        for (x in person) {                                     \
            text += person[x] + " ";                            \
        }                                                       \
        console.log(text);                                      \
    '])));

    it('switch (local) 1', () => expect('Hello!\r\nHello!\r\nHello!\r\nHello!\r\n').to.equals(new Run().test([
        'let a = 1;                                             \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                console.log("Hello!");                          \
                break;                                          \
            case 3:                                             \
                break;                                          \
            default:                                            \
                break;                                          \
        }                                                       \
        a = 2;                                                  \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                console.log("Hello!");                          \
                break;                                          \
            case 3:                                             \
                break;                                          \
            default:                                            \
                break;                                          \
        }                                                       \
        a = 3;                                                  \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                break;                                          \
            case 3:                                             \
                console.log("Hello!");                          \
                break;                                          \
            default:                                            \
                break;                                          \
        }                                                       \
        a = 4;                                                  \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                break;                                          \
            case 3:                                             \
                break;                                          \
            default:                                            \
                console.log("Hello!");                          \
                break;                                          \
        }                                                       \
    '])));

});
