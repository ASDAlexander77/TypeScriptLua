import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Regex', () => {

    it('Simple Regex test 1', () => expect('1\r\n').to.equals(new Run().test([
        'let navigator1 = \'iPad iPhone\';                  \
        const _badOS = /iPad/i.test(navigator1);            \
        const b = _badOS ? 1 : 0;                           \
        console.log(b);                                     \
    '])));

});
