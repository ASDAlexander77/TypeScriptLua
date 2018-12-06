import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Discrepancies', () => {

    it('0 is false in || expressions', () => expect(new Run().test([
         '                                              \
         console.log(null || null);                     \
         console.log(0 || null);                        \
         console.log(1 || null);                        \
                                                        \
         console.log(null || 0);                        \
         console.log(0 || 0);                           \
         console.log(1 || 0);                           \
                                                        \
         console.log(null || 1);                        \
         console.log(0 || 1);                           \
         console.log(1 || 1);                           \
         '])).to.equals('nil\r\nnil\r\n1\r\n0\r\n0\r\n1\r\n1\r\n1\r\n1\r\n'));

    it('0 is false in && expressions', () => expect(new Run().test([
        '                                              \
        console.log(null && null);                     \
        console.log(0 && null);                        \
        console.log(1 && null);                        \
                                                       \
        console.log(null && 0);                        \
        console.log(0 && 0);                           \
        console.log(1 && 0);                           \
                                                       \
        console.log(null && 1);                        \
        console.log(0 && 1);                           \
        console.log(1 && 1);                           \
        console.log(1 && 2);                           \
        '])).to.equals('nil\r\n0\r\nnil\r\nnil\r\n0\r\n0\r\nnil\r\n0\r\n1\r\n2\r\n'));
});
