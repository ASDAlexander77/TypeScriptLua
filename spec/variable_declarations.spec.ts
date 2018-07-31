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
    console.log(f());'])));
});
