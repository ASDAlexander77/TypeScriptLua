import { expect } from 'chai';
import { describe, it } from 'mocha';
import { renderReport } from '../scripts/conformance/report';
import { TestResult } from '../scripts/conformance/runner';

function result(name: string, category: any, nodeOut: string, luaOut: string): TestResult {
    return { name: name, category: category, nodeStdout: nodeOut, luaStdout: luaOut,
             detail: '' };
}

describe('conformance report', () => {

    it('counts each category in the summary', () => {
        const text = renderReport([
            result('a', 'MATCH', 'x', 'x'),
            result('b', 'MATCH', 'y', 'y'),
            result('c', 'DIFF', 'y', 'z')
        ]);
        expect(text).to.contain('| MATCH | 2 |');
        expect(text).to.contain('| DIFF | 1 |');
    });

    it('lists every test under its category', () => {
        const text = renderReport([result('array_join', 'DIFF', 'a', 'b')]);
        expect(text).to.contain('array_join');
    });

    it('shows a diff for DIFF entries', () => {
        const text = renderReport([result('array_join', 'DIFF', 'Fire,Air', 'Fire')]);
        expect(text).to.contain('- Fire,Air');
        expect(text).to.contain('+ Fire');
    });

    it('does not show a diff for MATCH entries', () => {
        const text = renderReport([result('ok', 'MATCH', 'same', 'same')]);
        expect(text).to.not.contain('+ same');
    });

    it('reports the console formatting deviation as a standing finding', () => {
        expect(renderReport([])).to.contain('console.log');
    });

});
