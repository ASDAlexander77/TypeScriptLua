import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Special cases', () => {

    it('Multiple assignments(local)', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        a = b = 1;                              \
                                                \
        console.log(a);                         \
    '])));

});
