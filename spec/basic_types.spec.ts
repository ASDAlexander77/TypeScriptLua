import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Basic Types', () => {

    it('simple true/false value: local', () => expect('false\r\n').to.equals(new Run().test([
        'let isDone: boolean = false;\
         console.log(isDone);'])));

    it('simple true/false value: console', () => expect('false\r\n').to.equals(new Run().test([
        'const isDone: boolean = false;\
        console.log(isDone);'])));

    it('simple true/false value: global', () => expect('false\r\n').to.equals(new Run().test([
        'var isDone: boolean = false;\
        console.log(isDone);'])));

    it('simple null value: local', () => expect('nil\r\n').to.equals(new Run().test([
        'let isDone: any = null;\
        console.log(isDone);'])));

    it('simple null value: local', () => expect('nil\r\n').to.equals(new Run().test([
        'const isDone: any = null;\
        console.log(isDone);'])));

    it('simple null value: global', () => expect('nil\r\n').to.equals(new Run().test([
        'var isDone: any = null;\
        console.log(isDone);'])));

});
