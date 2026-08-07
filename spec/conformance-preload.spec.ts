import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as path from 'path';
import { spawn } from 'cross-spawn';

const PRELOAD = path.join(__dirname, '..', 'scripts', 'conformance', 'preload.js');

function runNode(script: string): string {
    const result: any = spawn.sync(process.execPath, ['--require', PRELOAD, '-e', script]);
    return result.stdout.toString().replace(/\r\n/g, '\n');
}

describe('conformance node preload', () => {

    it('separates arguments with a tab', () =>
        expect(runNode('console.log("a", "b");')).to.equal('a\tb\n'));

    it('renders null as nil', () =>
        expect(runNode('console.log(null);')).to.equal('nil\n'));

    it('renders a flat array as a comma-joined list', () =>
        expect(runNode('console.log([1,2,3]);')).to.equal('1,2,3\n'));

    it('renders an array of strings without quotes or brackets', () =>
        expect(runNode('console.log(["a","b"]);')).to.equal('a,b\n'));

    it('renders an empty array as an empty line', () =>
        expect(runNode('console.log([]);')).to.equal('\n'));

    it('flattens a nested array the way join does', () =>
        expect(runNode('console.log([[1,2],[3]]);')).to.equal('1,2,3\n'));

    it('leaves plain strings alone', () =>
        expect(runNode('console.log("hello");')).to.equal('hello\n'));

    it('renders numbers and booleans as-is', () =>
        expect(runNode('console.log(1.5); console.log(true);')).to.equal('1.5\ntrue\n'));

});
