import * as fs from 'fs-extra';
import * as path from 'path';

// the upstream repo is a sibling checkout, not a dependency - the env var is the escape
// hatch for a machine that keeps it somewhere else
const UPSTREAM_DEFAULT = 'I:\\TypeScriptCompilerDefaultLib\\tests';

const root = path.join(__dirname, '..');
const conformanceDir = path.join(root, 'spec', 'conformance');
const testsDir = path.join(conformanceDir, 'tests');
const upstream = process.env.CONFORMANCE_UPSTREAM || UPSTREAM_DEFAULT;

if (!fs.existsSync(upstream)) {
    throw new Error('upstream conformance tests not found at "' + upstream
        + '" - set CONFORMANCE_UPSTREAM to the TypeScriptCompilerDefaultLib tests directory');
}

const files = fs.readdirSync(upstream).filter((f: string) => f.endsWith('.ts')).sort();
if (files.length === 0) {
    throw new Error('no .ts files found in "' + upstream + '"');
}

fs.removeSync(testsDir);
fs.mkdirpSync(testsDir);
files.forEach((f: string) => fs.copySync(path.join(upstream, f), path.join(testsDir, f)));

const provenance = [
    '# Provenance',
    '',
    'A snapshot of the TypeScriptCompilerDefaultLib conformance tests, vendored so the',
    'survey is reproducible on a machine that has only this repository, and so an upstream',
    'edit cannot turn the suite red with no commit here.',
    '',
    '- Source: `' + upstream + '`',
    '- Files: ' + files.length,
    '- Snapshot taken: ' + new Date().toISOString().slice(0, 10),
    '',
    'Do not edit these files here - fixes belong upstream. Re-sync with:',
    '',
    '```sh',
    'npm run conformance:refresh',
    '```',
    ''
].join('\n');

fs.writeFileSync(path.join(conformanceDir, 'PROVENANCE.md'), provenance);

console.log('Vendored ' + files.length + ' tests to ' + testsDir);
