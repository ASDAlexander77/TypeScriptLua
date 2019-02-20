import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Undefined/null cases', () => {

    it('strict equals/not equals', () => expect(new Run().test([
        'class undefined {}                                                     \
        console.log(null === null);                                             \
        console.log(undefined === null);                                        \
        console.log(undefined === undefined);                                   \
        console.log(null !== null);                                             \
        console.log(undefined !== null);                                        \
        console.log(undefined !== undefined);                                   \
    '])).to.equals('true\r\nfalse\r\ntrue\r\nfalse\r\ntrue\r\nfalse\r\n'));

    it('not strict equals/not equals', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null == null);                                             \
        console.log(undefined == null);                                        \
        console.log(undefined == undefined);                                   \
        console.log(null != null);                                             \
        console.log(undefined != null);                                        \
        console.log(undefined != undefined);                                   \
    '])).to.equals('true\r\ntrue\r\ntrue\r\nfalse\r\nfalse\r\nfalse\r\n'));

    it('strict 0', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null === 0);                                               \
        console.log(undefined === 0);                                          \
        console.log(null !== 0);                                               \
        console.log(undefined !== 0);                                          \
    '])).to.equals('false\r\nfalse\r\ntrue\r\ntrue\r\n'));

    it('strict ""', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null === "");                                              \
        console.log(undefined === "");                                         \
        console.log(null !== "");                                              \
        console.log(undefined !== "");                                         \
    '])).to.equals('false\r\nfalse\r\ntrue\r\ntrue\r\n'));

    it('not strict 0', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null == 0);                                                \
        console.log(undefined == 0);                                           \
        console.log(null != 0);                                                \
        console.log(undefined != 0);                                           \
    '])).to.equals('true\r\ntrue\r\nfalse\r\nfalse\r\n'));

    it('not strict ""', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null == "");                                               \
        console.log(undefined == "");                                          \
        console.log(null != "");                                               \
        console.log(undefined != "");                                          \
    '])).to.equals('true\r\ntrue\r\nfalse\r\nfalse\r\n'));

});
