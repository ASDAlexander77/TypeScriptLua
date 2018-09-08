import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Export', () => {

    it('Class export', () => expect('false\r\n').to.equals(new Run().test([
        'export class ZipCodeValidator {            \
            isAcceptable(s: string): boolean {      \
                return false;                       \
            }                                       \
        }                                           \
    ',
    'import { ZipCodeValidator } from "./test0";    \
    const myValidator = new ZipCodeValidator();     \
    console.log(myValidator.isAcceptable("test"));  \
    '])));

});
