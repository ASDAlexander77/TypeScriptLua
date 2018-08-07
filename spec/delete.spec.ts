import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Delete', () => {

    it('Local', () => expect('nil\r\n').to.equals(new Run().test([
        'let a = { obj: "asd" };                    \
        delete a.obj;                               \
        console.log(a.obj);                         \
    '])));

});
