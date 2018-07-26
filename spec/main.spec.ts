import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe.skip('Simple Run command test', () => {

    it('Hello World!', async () => await new Run().run(["test.ts"], "test.luabc"));

});

describe.skip('Simple Test command test', () => {

    it('Hello World!', () => expect("Hello World!", new Run().test(["console.log('Hello World!');"])))
        
});
