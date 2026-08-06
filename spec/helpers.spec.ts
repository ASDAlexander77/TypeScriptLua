import { Helpers } from '../src/helpers';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Helpers.isJsLib', () => {

    it('is true for the -jslib command line option', () =>
        expect(Helpers.isJsLib(undefined, { jslib: true })).to.equals(true));

    it('is true for a modern es lib without es5', () =>
        expect(Helpers.isJsLib(<any>{ lib: ['lib.es2018.d.ts'] }, {})).to.equals(true));

    it('is false when es5 is among the libs', () =>
        expect(Helpers.isJsLib(<any>{ lib: ['lib.es5.d.ts', 'lib.es2018.d.ts'] }, {})).to.equals(false));

    it('is false with no options at all', () =>
        expect(Helpers.isJsLib(undefined, undefined)).to.equals(false));

});
