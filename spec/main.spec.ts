import { Run } from '../src/compiler';
import { expect } from 'chai';
import 'mocha';

describe('Simple compile', () => {

    it('Hello World 1', async () => await new Run().run(["test.ts"], "test.luabc"));

});
