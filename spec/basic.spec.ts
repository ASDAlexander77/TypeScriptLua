import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Test 1', () => {

    it('print "Hello World!" as string const.', () => expect('Hello World!').to.equals(new Run().test(['console.log("Hello World!");'])));

    it('pritn "Hello World!" as variable', () => expect('Hello World!').to.equals(new Run().test([
        '                                       \
            var x:string = "Hello World!";      \
            console.log(x);                     \
        '])));

    it('print true,1,1.5,Hello World!', () => expect('1').to.equals(new Run().test([
        '                                       \
            var x = true;                       \
            console.log(x);                     \
            var x = 1;                          \
            console.log(x);                     \
            var x = 1.5;                        \
            console.log(x);                     \
            var x = "Hello World!";             \
            console.log(x);                     \
        '])));
});
