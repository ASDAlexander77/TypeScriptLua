import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Discrepancies', () => {

    it('0 is false in || expressions', () => expect(new Run().test([
         'console.log(undefined || 10);                 \
         console.log(null || 10);                       \
         console.log(0 || 10);                          \
    '])).to.equals('10\r\n10\r\n10\r\n'));

});
