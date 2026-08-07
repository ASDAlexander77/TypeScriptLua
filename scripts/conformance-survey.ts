import * as fs from 'fs-extra';
import * as path from 'path';
import { runTest, TestResult } from './conformance/runner';
import { renderReport } from './conformance/report';

const root = path.join(__dirname, '..');
const testsDir = path.join(root, 'spec', 'conformance', 'tests');
const reportPath = path.join(root, 'spec', 'conformance', 'REPORT.md');

if (!fs.existsSync(path.join(root, '__out', 'src', 'main.js'))) {
    throw new Error('__out/src/main.js not found - run "npm run build" first');
}

if (!fs.existsSync(testsDir)) {
    throw new Error(testsDir + ' not found - run "npm run conformance:refresh" first');
}

// a single test name may be passed to survey just that one, for iterating on a finding
const only = process.argv[2];
const files = fs.readdirSync(testsDir)
    .filter((f: string) => f.endsWith('.ts'))
    .filter((f: string) => !only || f === only || f === only + '.ts')
    .sort();

const results: TestResult[] = [];

files.forEach((file: string, index: number) => {
    const name = file.replace(/\.ts$/, '');
    const source = fs.readFileSync(path.join(testsDir, file), 'utf8');
    const result = runTest(name, source);
    results.push(result);
    console.log(String(index + 1) + '/' + files.length + ' ' + name + ' - ' + result.category);
});

fs.writeFileSync(reportPath, renderReport(results));

console.log('');
console.log('Wrote ' + reportPath);
