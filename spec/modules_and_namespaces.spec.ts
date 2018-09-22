import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Modules', () => {

    it('Module 1', () => expect('1\r\n').to.equals(new Run().test([
        'module M {                                 \
            export class C {                        \
                static Y() { return 2; }            \
                                                    \
                X() { return 1; }                   \
            }                                       \
        }                                           \
                                                    \
        const c = new M.C();                        \
        console.log(c.X());                         \
    '])));

});
