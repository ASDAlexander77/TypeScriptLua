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

    it('Module 2 - nested', () => expect('1\r\n').to.equals(new Run().test([
        'module M1  {                               \
            module M2 {                             \
                export class C {                    \
                    static Y() { return 2; }        \
                                                    \
                    X() { return 1; }               \
                }                                   \
            }                                       \
        }                                           \
                                                    \
        const c = new M1.M2.C();                    \
        console.log(c.X());                         \
    '])));

    it('Module 3 - <module1>.<module2>', () => expect('1\r\n').to.equals(new Run().test([
        'module M1.M2 {                             \
            export class C {                        \
                static Y() { return 2; }            \
                                                    \
                X() { return 1; }                   \
            }                                       \
        }                                           \
                                                    \
        const c = new M1.M2.C();                    \
        console.log(c.X());                         \
    '])));

    it('Module - export function', () => expect('Hi\r\n').to.equals(new Run().test([
        'module M1.M2 {                             \
            export function f() {                   \
                console.log("Hi");                  \
            }                                       \
        }                                           \
                                                    \
        M1.M2.f();                                  \
    '])));

});
