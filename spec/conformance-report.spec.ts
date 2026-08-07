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

    it('escapes backticks in detail to preserve fence parity', () => {
        const testResult: TestResult = {
            name: 'error_test',
            category: 'LUA_COMPILE_FAIL',
            nodeStdout: '',
            luaStdout: '',
            detail: 'stack trace:\n```\nsome code'
        };
        const text = renderReport([testResult]);
        // The detail contains ``` so fence should be at least 4 backticks
        // Find the fence opening after error_test
        const testIdx = text.indexOf('### error_test');
        expect(testIdx).to.be.greaterThan(-1);
        const afterTest = text.substring(testIdx);
        // Should have a 4-backtick fence to escape the 3-backtick content
        expect(afterTest).to.contain('````text');
        // Verify the detail is properly closed with a matching fence
        expect(afterTest).to.contain('````');
        // Most importantly, verify the Standing findings section is still accessible
        // (not corrupted by unclosed fence)
        expect(text).to.contain('## Standing findings');
    });

    it('preserves diff block integrity when context line contains backticks', () => {
        const text = renderReport([
            result('backtick_test', 'DIFF', 'before\n```\nafter1', 'before\n```\nafter2')
        ]);
        // Should contain the diff markers for the differing lines
        expect(text).to.contain('- after1');
        expect(text).to.contain('+ after2');
        // The diff context line contains ``` so fence should be at least 4 backticks
        const testIdx = text.indexOf('### backtick_test');
        expect(testIdx).to.be.greaterThan(-1);
        const afterTest = text.substring(testIdx);
        // Should have a 4-backtick fence for the diff block
        expect(afterTest).to.contain('````diff');
        // The diff markers should be inside the fence, not escaped outside
        const diffStart = afterTest.indexOf('````diff');
        const diffEnd = afterTest.indexOf('````', diffStart + 4);
        const diffBlock = afterTest.substring(diffStart, diffEnd);
        expect(diffBlock).to.contain('- after1');
        expect(diffBlock).to.contain('+ after2');
    });

});
