import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Test 1', () => {

    it('Hello World 1', () => expect("Hello World!", new Run().test(["console.log('Hello World!');"])));

});

describe('Test 2', () => {

    it('Hello World 2', () => expect("Hello World!", new Run().test([
"                                       \
    var x:string = 'Hello World!';      \
    console.log(x);                     \
"])));

});
