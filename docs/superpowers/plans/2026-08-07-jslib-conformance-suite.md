# jslib Conformance Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `npm run conformance` — a survey that runs 150 vendored TypeScript conformance tests against jslib, diffs each against Node, and writes `spec/conformance/REPORT.md`.

**Architecture:** Three pure modules (transform, report) and one impure one (runner) behind a thin CLI. The transform turns an upstream test into the two sources actually executed; the runner executes both and classifies the outcome; the report renders results as markdown. Node is the oracle: whatever Node prints is correct.

**Tech Stack:** TypeScript 3.3 run through `ts-node` (never compiled by `npm run build`), `fs-extra`, `cross-spawn`, mocha + chai for the tooling's own tests, `node --experimental-strip-types` for the Node side, `__dist/lua.exe` for the Lua side.

**One refinement on the spec's §2 layout.** The spec names two script files, `scripts/refresh-conformance.ts` and `scripts/conformance-survey.ts`. Both exist here with those names and those responsibilities, but the survey's internals are split into `scripts/conformance/{transform,runner,report}.ts` plus `preload.js` rather than living in one file. The transform and the report are pure functions and are unit-tested directly; keeping them in the CLI entry point would have made the only way to test them an end-to-end run.

## Global Constraints

- **TypeScript 3.3.** No optional chaining (`?.`), no nullish coalescing (`??`), no `satisfies`. `strictNullChecks` is off.
- **Scripts are ts-node-only.** `tsconfig.json` has `"include": ["src/**/*.ts"]`, so nothing under `scripts/` is compiled by `npm run build`. Run them with `ts-node`, matching `npm run build-jslib-dts`.
- **Spec files must `import { describe, it } from 'mocha';`.** `npm test` passes `-u tdd`, so the bdd globals do not exist; every existing spec imports them explicitly.
- **Use `fs-extra` for filesystem work** (`removeSync`, `mkdirpSync`, `copySync`) and `import { spawn } from 'cross-spawn';` + `spawn.sync` for processes, matching `src/compiler.ts`.
- **`npm run build` must have been run** before the survey — the Lua side shells out to `__out/src/main.js`.
- **The survey exits 0 regardless of what it finds.** It is a report, not a gate: no number of `DIFF` or `LUA_CRASH` results may fail the command. A missing prerequisite is not a finding — it still fails loudly, so a mis-invocation cannot look like a clean run.
- **The runner's integration tests live outside `spec/`,** in `selftest/`, run by `npm run conformance:selftest`. They spawn node, tsc-lua and lua.exe, so keeping them in `spec/**/*.spec.ts` would make `npm test` slow and give it a dependency on `npm run build` that it does not have today.
- **Never modify anything under `spec/conformance/tests/`.** It is a snapshot.

---

### Task 1: Vendor the test snapshot

**Files:**

- Create: `scripts/refresh-conformance.ts`
- Create (generated): `spec/conformance/tests/*.ts`, `spec/conformance/PROVENANCE.md`
- Modify: `package.json` (scripts section)

**Interfaces:**

- Consumes: nothing.
- Produces: `spec/conformance/tests/` containing 150 `.ts` files. Every later task reads tests from this directory.

- [ ] **Step 1: Write the refresh script**

Create `scripts/refresh-conformance.ts`:

```ts
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
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `"scripts"` alongside `build-jslib-dts`:

```json
"conformance:refresh": "ts-node scripts/refresh-conformance.ts",
```

- [ ] **Step 3: Run it**

Run: `npm run conformance:refresh`
Expected: `Vendored 150 tests to ...\spec\conformance\tests`

- [ ] **Step 4: Verify the snapshot**

Run: `node -e "console.log(require('fs').readdirSync('spec/conformance/tests').length)"`
Expected: `150`

Run: `node -e "console.log(require('fs').existsSync('spec/conformance/PROVENANCE.md'))"`
Expected: `true`

- [ ] **Step 5: Commit**

```bash
git add scripts/refresh-conformance.ts spec/conformance package.json
git commit -m "test: vendor TypeScriptCompilerDefaultLib conformance tests"
```

---

### Task 2: The source transform

**Files:**

- Create: `scripts/conformance/transform.ts`
- Test: `spec/conformance-transform.spec.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `transform(source: string): TransformedTest` where `TransformedTest` is `{ lua: string; node: string }`. Task 4 and Task 5 call this.

Three transforms are needed, established by probing the real pipeline:

1. The Lua side needs `import './JS';` — without it the emitted Lua defines no `console`, `String` or `Array` and dies with `attempt to index a nil value (global 'console')`. The Node side must **not** get it; `./JS` is a Lua module.
2. 71 files call a bare `assert(` that nothing defines. Both sides need the same shim.
3. 57 files declare `function main()` and never call it — the MLIR compiler invokes `main` as the entry point. Both sides need `main();` appended.

- [ ] **Step 1: Write the failing test**

Create `spec/conformance-transform.spec.ts`:

```ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { transform } from '../scripts/conformance/transform';

describe('conformance transform', () => {

    it('adds the JS import to the lua side only', () => {
        const out = transform('console.log(1);');
        expect(out.lua).to.contain('import \'./JS\';');
        expect(out.node).to.not.contain('./JS');
    });

    it('adds an assert shim when the test calls assert', () => {
        const out = transform('assert(1 === 1);');
        expect(out.lua).to.contain('function assert(');
        expect(out.node).to.contain('function assert(');
    });

    it('does not add an assert shim when the test never calls assert', () => {
        const out = transform('console.log(1);');
        expect(out.lua).to.not.contain('function assert(');
    });

    it('does not add an assert shim when the test defines its own', () => {
        const out = transform('function assert(c: any) { }\nassert(true);');
        expect(out.lua.indexOf('function assert(')).to.equal(
            out.lua.lastIndexOf('function assert('));
    });

    it('appends a main() call when main is declared but never called', () => {
        const out = transform('function main() { console.log(1); }');
        expect(out.lua).to.contain('\nmain();');
        expect(out.node).to.contain('\nmain();');
    });

    it('does not append main() when the test already calls it', () => {
        const out = transform('function main() { }\nmain();');
        expect(out.node.match(/main\(\);/g).length).to.equal(1);
    });

    it('does not append main() when there is no main', () => {
        const out = transform('console.log(1);');
        expect(out.lua).to.not.contain('main();');
    });

    it('preserves the original body verbatim', () => {
        const body = 'const p = "a dog";\nconsole.log(p.indexOf("dog"));';
        expect(transform(body).node).to.contain(body);
    });

});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx mocha -u tdd --timeout 10000 -r ts-node/register spec/conformance-transform.spec.ts`
Expected: FAIL — `Cannot find module '../scripts/conformance/transform'`

- [ ] **Step 3: Implement the transform**

Create `scripts/conformance/transform.ts`:

```ts
// The vendored tests were written for the MLIR TypeScript compiler. Three things differ
// here, and each is patched onto a copy - the vendored file is never touched. See
// docs/superpowers/specs/2026-08-07-jslib-conformance-suite-design.md.

export interface TransformedTest {
    // compiled by tsc-lua and executed by lua.exe
    lua: string;
    // executed by 'node --experimental-strip-types'
    node: string;
}

// './JS' is a Lua module, so this goes on the lua side alone
const JS_IMPORT = 'import \'./JS\';\n';

// prepended to BOTH sides, so an assertion behaves identically in each
const ASSERT_SHIM = [
    'function assert(condition: any, message?: string): void {',
    '    if (!condition) {',
    '        throw new Error(\'assertion failed\' + (message ? \': \' + message : \'\'));',
    '    }',
    '}',
    ''
].join('\n');

// 'assert(' not preceded by a dot or word character, so 'chai.assert(' would not count
const CALLS_ASSERT = /(^|[^.\w])assert\s*\(/;
const DEFINES_ASSERT = /(function\s+assert\s*\(|(?:const|let|var)\s+assert\s*=)/;

const DECLARES_MAIN = /(^|\n)\s*(?:async\s+)?function\s+main\s*\(/;
// a call sits at the start of a statement; the 'function main(' declaration cannot match,
// because 'main' there is preceded by 'function ' rather than by a statement boundary
const CALLS_MAIN = /(^|\n|;|\})\s*main\s*\(\s*\)/;

export function transform(source: string): TransformedTest {
    let body = source;

    if (CALLS_ASSERT.test(body) && !DEFINES_ASSERT.test(body)) {
        body = ASSERT_SHIM + body;
    }

    if (DECLARES_MAIN.test(body) && !CALLS_MAIN.test(body)) {
        body = body + '\nmain();\n';
    }

    return { lua: JS_IMPORT + body, node: body };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx mocha -u tdd --timeout 10000 -r ts-node/register spec/conformance-transform.spec.ts`
Expected: PASS, 8 passing

- [ ] **Step 5: Check the transform against the real corpus**

Create `scripts/conformance/count-transforms.ts` (a throwaway check, deleted in Step 6):

```ts
import * as fs from 'fs-extra';
import * as path from 'path';
import { transform } from './transform';

const dir = path.join(__dirname, '..', '..', 'spec', 'conformance', 'tests');
let shimmed = 0;
let mainAppended = 0;

fs.readdirSync(dir).forEach((file: string) => {
    const out = transform(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (out.node.indexOf('function assert(') === 0) { shimmed++; }
    if (out.node.lastIndexOf('\nmain();\n') === out.node.length - '\nmain();\n'.length) {
        mainAppended++;
    }
});

console.log('shimmed ' + shimmed + ' main-appended ' + mainAppended);
```

Run: `npx ts-node scripts/conformance/count-transforms.ts`
Expected: `shimmed 71 main-appended 57` — the counts measured on the real corpus during design. A different number means a detection regex is wrong. Fix the regex; do **not** adjust the expected numbers to match the code.

- [ ] **Step 6: Delete the throwaway checker and commit**

```bash
rm scripts/conformance/count-transforms.ts
git add scripts/conformance/transform.ts spec/conformance-transform.spec.ts
git commit -m "test: add conformance source transform"
```

---

### Task 3: The Node console preload

**Files:**

- Create: `scripts/conformance/preload.js`
- Test: `spec/conformance-preload.spec.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: a CommonJS file suitable for `node --require`. Task 4 passes its path to the Node run.

jslib's `console.log` and Node's disagree. Measured against the real runtime:

| logged value | jslib prints | Node prints |
| --- | --- | --- |
| `null` | `nil` | `null` |
| `[1,2,3]` | `1,2,3` | `[ 1, 2, 3 ]` |
| `["a","b"]` | `a,b` | `[ 'a', 'b' ]` |
| `[]` | *(empty line)* | `[]` |
| `[[1,2],[3]]` | `1,2,3` | `[ [ 1, 2 ], [ 3 ] ]` |
| `"a", "b"` | `a<TAB>b` | `a b` |

jslib's rule is: render each argument with `Array.prototype.join(',')` semantics, render `null` as `nil`, and separate arguments with a tab. The Node side is adapted down to that, so a reported diff means a value differs rather than a printer differs.

`console.log(undefined)` crashes jslib outright, so no agreed rendering exists; the preload leaves Node's `undefined` and the Lua side is classified `LUA_CRASH`, which is the honest result.

- [ ] **Step 1: Write the failing test**

Create `spec/conformance-preload.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx mocha -u tdd --timeout 10000 -r ts-node/register spec/conformance-preload.spec.ts`
Expected: FAIL — `Cannot find module` for `preload.js`

- [ ] **Step 3: Implement the preload**

Create `scripts/conformance/preload.js` (plain CommonJS — it is a `--require` target, not compiled):

```js
// Node's console.log and jslib's disagree about formatting: jslib separates arguments with
// a tab and renders arrays through Array.prototype.join(','), where Node uses spaces and
// util.inspect. The survey compares values, not printers, so the Node side is adapted down
// to jslib's format here. The deviation itself is reported separately, not swept away -
// see docs/superpowers/specs/2026-08-07-jslib-conformance-suite-design.md.
'use strict';

function format(value) {
    if (value === null) {
        return 'nil';
    }

    if (Array.isArray(value)) {
        return value.join(',');
    }

    return String(value);
}

console.log = function () {
    const args = Array.prototype.slice.call(arguments);
    process.stdout.write(args.map(format).join('\t') + '\n');
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx mocha -u tdd --timeout 10000 -r ts-node/register spec/conformance-preload.spec.ts`
Expected: PASS, 8 passing

- [ ] **Step 5: Commit**

```bash
git add scripts/conformance/preload.js spec/conformance-preload.spec.ts
git commit -m "test: add node console preload matching jslib formatting"
```

---

### Task 4: The runner

**Files:**

- Create: `scripts/conformance/runner.ts`
- Test: `selftest/conformance-runner.spec.ts`

**Interfaces:**

- Consumes: `transform(source)` from Task 2; `scripts/conformance/preload.js` from Task 3; `Run.getLuaInterpreter()` from `src/compiler`.
- Produces:
  - `type Category = 'MATCH' | 'DIFF' | 'LUA_CRASH' | 'LUA_COMPILE_FAIL' | 'NODE_FAIL' | 'NONDET';`
  - `interface TestResult { name: string; category: Category; nodeStdout: string; luaStdout: string; detail: string; }`
  - `function runTest(name: string, source: string): TestResult`

  Task 5 renders `TestResult[]`; Task 6 produces them.

- [ ] **Step 1: Write the failing test**

Create `selftest/conformance-runner.spec.ts`:

```ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { runTest } from '../scripts/conformance/runner';

// each case spawns node twice plus tsc-lua plus lua.exe
const TIMEOUT = 120000;

describe('conformance runner', function () {
    this.timeout(TIMEOUT);

    it('reports MATCH when jslib agrees with node', () => {
        const result = runTest('agree', 'console.log("a dog".indexOf("dog"));');
        expect(result.category).to.equal('MATCH');
        expect(result.nodeStdout).to.equal('2');
    });

    it('reports DIFF when jslib disagrees with node', () => {
        // a non-global regex must replace only the first occurrence; jslib replaces both
        const result = runTest('disagree',
            'console.log("dog and dog".replace(/Dog/i, "cat"));');
        expect(result.category).to.equal('DIFF');
        expect(result.nodeStdout).to.equal('cat and dog');
        expect(result.luaStdout).to.not.equal(result.nodeStdout);
    });

    it('reports NONDET when node output is not reproducible', () => {
        const result = runTest('nondet', 'console.log(Date.now());');
        expect(result.category).to.equal('NONDET');
    });

    it('reports NODE_FAIL when the test does not run under node', () => {
        const result = runTest('nodefail', 'throw new Error("boom");');
        expect(result.category).to.equal('NODE_FAIL');
    });

    it('runs the assert shim on both sides', () => {
        const result = runTest('asserts', 'assert(1 === 1);\nconsole.log("ok");');
        expect(result.category).to.equal('MATCH');
        expect(result.nodeStdout).to.equal('ok');
    });

});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx mocha -u tdd --timeout 120000 -r ts-node/register selftest/conformance-runner.spec.ts`
Expected: FAIL — `Cannot find module '../scripts/conformance/runner'`

- [ ] **Step 3: Implement the runner**

Create `scripts/conformance/runner.ts`:

```ts
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'cross-spawn';
import { Run } from '../../src/compiler';
import { transform } from './transform';

const TIMEOUT_MS = 20000;

const REPO_ROOT = path.join(__dirname, '..', '..');
const JS_LUA = path.join(REPO_ROOT, 'experiments', 'jslib', 'JS.lua');
const TSC_LUA = path.join(REPO_ROOT, '__out', 'src', 'main.js');
const PRELOAD = path.join(__dirname, 'preload.js');

export type Category =
    'MATCH' | 'DIFF' | 'LUA_CRASH' | 'LUA_COMPILE_FAIL' | 'NODE_FAIL' | 'NONDET';

export interface TestResult {
    name: string;
    category: Category;
    nodeStdout: string;
    luaStdout: string;
    // why it landed in this category: the stderr, or a note. empty for MATCH.
    detail: string;
}

interface Outcome {
    ok: boolean;
    stdout: string;
    stderr: string;
}

// lua.exe prints CRLF on windows and node prints LF, and a trailing blank line is an
// artifact of the last print rather than content. trailing whitespace WITHIN a line is
// left alone on purpose - stripping it would report a padEnd/padStart/trim defect as a
// MATCH, and those are exactly the tests this survey exists to check
function normalize(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n+$/, '');
}

function exec(command: string, args: string[], cwd: string): Outcome {
    const result: any = spawn.sync(command, args, { cwd: cwd, timeout: TIMEOUT_MS });
    const stdout = result.stdout ? result.stdout.toString() : '';
    const stderr = result.stderr ? result.stderr.toString() : '';

    if (result.error) {
        return { ok: false, stdout: stdout, stderr: String(result.error.message) };
    }

    // a timeout kills the child, leaving a signal and a null status
    if (result.status !== 0) {
        const why = result.signal ? 'killed by ' + result.signal : 'exit ' + result.status;
        return { ok: false, stdout: stdout, stderr: why + '\n' + stderr };
    }

    return { ok: true, stdout: stdout, stderr: stderr };
}

function runNode(source: string, workDir: string): Outcome {
    const file = path.join(workDir, 'node_test.ts');
    fs.writeFileSync(file, source);

    return exec(
        process.execPath,
        ['--experimental-strip-types', '--require', PRELOAD, file],
        workDir);
}

function runLua(source: string, workDir: string): { compiled: boolean; outcome: Outcome } {
    // the emitted lua does require("./JS"), resolved relative to itself
    fs.copySync(JS_LUA, path.join(workDir, 'JS.lua'));

    const tsFile = path.join(workDir, 'lua_test.ts');
    fs.writeFileSync(tsFile, source);

    const compile = exec(process.execPath, [TSC_LUA, '-jslib', tsFile], workDir);
    const luaFile = path.join(workDir, 'lua_test.lua');
    if (!compile.ok || !fs.existsSync(luaFile)) {
        return { compiled: false, outcome: compile };
    }

    return { compiled: true, outcome: exec(Run.getLuaInterpreter(), [luaFile], workDir) };
}

export function runTest(name: string, source: string): TestResult {
    const sources = transform(source);
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jslib-conf-'));

    const result = (category: Category, nodeOut: string, luaOut: string, detail: string) =>
        ({ name: name, category: category, nodeStdout: nodeOut, luaStdout: luaOut,
           detail: detail });

    try {
        const first = runNode(sources.node, workDir);
        if (!first.ok) {
            return result('NODE_FAIL', '', '', first.stderr);
        }

        // run node twice - anything printing the clock differs between the two, and is
        // excluded rather than reported as a jslib defect
        const second = runNode(sources.node, workDir);
        const nodeOut = normalize(first.stdout);

        // a run that FAILED is a failure, not evidence of nondeterminism. folding it into
        // NONDET would drop the test from the findings under a reason that is not true,
        // and throw away the stderr needed to notice
        if (!second.ok) {
            return result('NODE_FAIL', nodeOut, '', second.stderr);
        }

        if (nodeOut !== normalize(second.stdout)) {
            return result('NONDET', nodeOut, '', 'node output differs between two runs');
        }

        const lua = runLua(sources.lua, workDir);
        if (!lua.compiled) {
            return result('LUA_COMPILE_FAIL', nodeOut, '', lua.outcome.stderr);
        }

        if (!lua.outcome.ok) {
            return result('LUA_CRASH', nodeOut, normalize(lua.outcome.stdout),
                lua.outcome.stderr);
        }

        const luaOut = normalize(lua.outcome.stdout);
        return luaOut === nodeOut
            ? result('MATCH', nodeOut, luaOut, '')
            : result('DIFF', nodeOut, luaOut, '');
    } finally {
        // on windows a killed lua.exe can still hold its .lua open, and an EPERM here
        // would escape runTest and abort the whole sweep, discarding every result
        // collected so far. a leaked temp directory is the cheaper failure
        try {
            fs.removeSync(workDir);
        } catch (e) {
            // ignore
        }
    }
}
```

- [ ] **Step 4: Add the self-test npm script**

These tests spawn node twice, tsc-lua and lua.exe per case, so they stay out of `spec/**/*.spec.ts` and out of `npm test`. In `package.json`, add to `"scripts"`:

```json
"conformance:selftest": "mocha -u tdd --timeout 180000 --colors -r ts-node/register selftest/**/*.spec.ts",
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run build` (the runner shells out to `__out/src/main.js`)
Run: `npm run conformance:selftest`
Expected: PASS, 5 passing

If `MATCH` cases come back `LUA_COMPILE_FAIL`, read `result.detail` — it carries tsc-lua's stderr verbatim.

- [ ] **Step 6: Confirm `npm test` is unaffected**

Run: `npm test`
Expected: 244 pre-existing + 16 from Tasks 2-3 = 260 passing. The runner's 5 tests must **not** appear — if they do, they are still inside the `spec/**/*.spec.ts` glob.

- [ ] **Step 7: Commit**

```bash
git add scripts/conformance/runner.ts selftest/conformance-runner.spec.ts package.json
git commit -m "test: add conformance runner with node oracle"
```

---

### Task 5: The report writer

**Files:**

- Create: `scripts/conformance/report.ts`
- Test: `spec/conformance-report.spec.ts`

**Interfaces:**

- Consumes: `TestResult` and `Category` from Task 4.
- Produces: `function renderReport(results: TestResult[]): string`. Task 6 writes its return value to `spec/conformance/REPORT.md`.

- [ ] **Step 1: Write the failing test**

Create `spec/conformance-report.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx mocha -u tdd --timeout 10000 -r ts-node/register spec/conformance-report.spec.ts`
Expected: FAIL — `Cannot find module '../scripts/conformance/report'`

- [ ] **Step 3: Implement the report**

> **Amended after review.** The fixed fences below are a bug: `detail` carries raw stderr, which can contain backtick runs, and an odd number of them destroys fence parity for the rest of the document. The shipped code adds a `getFence(content)` helper returning `max(3, longest backtick run + 1)` backticks, used for both the `detail` fence and the diff fence. Content is never escaped or stripped — it must appear verbatim. See `scripts/conformance/report.ts` as shipped.

Create `scripts/conformance/report.ts`:

```ts
import { Category, TestResult } from './runner';

const ORDER: Category[] = [
    'DIFF', 'LUA_CRASH', 'LUA_COMPILE_FAIL', 'MATCH', 'NONDET', 'NODE_FAIL'];

const MEANING: { [key: string]: string } = {
    MATCH: 'lua stdout equals node stdout',
    DIFF: 'both ran, outputs differ - a jslib behaviour bug',
    LUA_CRASH: 'lua.exe errored or timed out',
    LUA_COMPILE_FAIL: 'tsc-lua threw, or emitted nothing',
    NODE_FAIL: 'does not run under node either - excluded, not a jslib finding',
    NONDET: 'node output not reproducible - excluded'
};

// a line-oriented diff is enough here: these outputs are short, and the point is to show
// what changed rather than to minimise the edit script
function renderDiff(expected: string, actual: string): string[] {
    const expectedLines = expected.split('\n');
    const actualLines = actual.split('\n');
    const lines: string[] = ['```diff'];

    for (let i = 0; i < Math.max(expectedLines.length, actualLines.length); i++) {
        const e = expectedLines[i];
        const a = actualLines[i];
        if (e === a) {
            lines.push('  ' + (e === undefined ? '' : e));
        } else {
            if (e !== undefined) { lines.push('- ' + e); }
            if (a !== undefined) { lines.push('+ ' + a); }
        }
    }

    lines.push('```');
    return lines;
}

export function renderReport(results: TestResult[]): string {
    const lines: string[] = [
        '# jslib conformance report',
        '',
        'Generated by `npm run conformance`. Node is the oracle: `-` is what node printed,',
        '`+` is what jslib printed.',
        '',
        '## Summary',
        '',
        '| Category | Count | Meaning |',
        '| --- | --- | --- |'
    ];

    ORDER.forEach((category: Category) => {
        const count = results.filter((r: TestResult) => r.category === category).length;
        lines.push('| ' + category + ' | ' + count + ' | ' + MEANING[category] + ' |');
    });

    lines.push('', 'Total: ' + results.length + ' tests.', '');
    lines.push('## Standing findings', '');
    lines.push('- jslib\'s `console.log` separates arguments with a tab where node uses a');
    lines.push('  space, and renders arrays through `join(\',\')` where node uses `inspect`.');
    lines.push('  The node side is adapted down to jslib\'s format, so it does not appear as');
    lines.push('  a diff below. `console.log(undefined)` crashes jslib outright.');
    lines.push('');

    ORDER.forEach((category: Category) => {
        const inCategory = results.filter((r: TestResult) => r.category === category);
        if (inCategory.length === 0) {
            return;
        }

        lines.push('## ' + category + ' (' + inCategory.length + ')', '');

        inCategory.forEach((r: TestResult) => {
            lines.push('### ' + r.name, '');

            if (r.category === 'DIFF') {
                renderDiff(r.nodeStdout, r.luaStdout).forEach((l: string) => lines.push(l));
                lines.push('');
            } else if (r.detail) {
                lines.push('```text', r.detail.replace(/\s+$/, ''), '```', '');
            }
        });
    });

    return lines.join('\n');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx mocha -u tdd --timeout 10000 -r ts-node/register spec/conformance-report.spec.ts`
Expected: PASS, 5 passing

- [ ] **Step 5: Commit**

```bash
git add scripts/conformance/report.ts spec/conformance-report.spec.ts
git commit -m "test: add conformance report renderer"
```

---

### Task 6: The CLI, and the first real survey

**Files:**

- Create: `scripts/conformance-survey.ts`
- Create (generated): `spec/conformance/REPORT.md`
- Modify: `package.json` (scripts section)

**Interfaces:**

- Consumes: `runTest` from Task 4, `renderReport` from Task 5, the vendored tests from Task 1.
- Produces: `npm run conformance`.

- [ ] **Step 1: Write the CLI**

Create `scripts/conformance-survey.ts`:

```ts
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
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `"scripts"`:

```json
"conformance": "ts-node scripts/conformance-survey.ts",
```

- [ ] **Step 3: Smoke-test on a single file**

Run: `npm run conformance -- string_indexOf`
Expected: one progress line ending in a category, then `Wrote ...REPORT.md`

- [ ] **Step 4: Run the full survey**

Run: `npm run build`
Run: `npm run conformance`
Expected: 150 progress lines, then `Wrote ...\spec\conformance\REPORT.md`. Exit code 0.

- [ ] **Step 5: Check the whole suite still passes**

Run: `npm test`
Expected: 244 pre-existing + 21 from Tasks 2, 3 and 5 = 265 passing. No failures.

Run: `npm run conformance:selftest`
Expected: 5 passing — the runner's integration tests, which stay out of `npm test`.

- [ ] **Step 6: Commit**

```bash
git add scripts/conformance-survey.ts spec/conformance/REPORT.md package.json
git commit -m "feat: add jslib conformance survey"
```

- [ ] **Step 7: Read the report and summarise**

Open `spec/conformance/REPORT.md` and report back:

- the category counts
- the `DIFF` list — these are confirmed jslib behaviour bugs, the actionable output
- the `LUA_COMPILE_FAIL` list — these are missing jslib features
- whether the `MATCH` count is large enough to justify stage 2, or whether a handful of
  targeted specs would serve better

Do **not** fix any jslib bug the survey finds. That is separate work, prioritised from this
report.

---

## Notes for the implementer

- **`npm run build` before anything that runs the Lua side.** The runner shells out to `__out/src/main.js`. A stale `__out` silently surveys the wrong compiler.
- **The counts in Task 2 Step 5 (71 / 57) are load-bearing.** They were measured on the real corpus. If they come out different, a detection regex is wrong — do not adjust the expected numbers to match the code.
- **`spec/conformance/tests/` is a snapshot.** If a test looks broken, that is a finding, not something to edit.
- **Expect a large `LUA_COMPILE_FAIL` bucket.** jslib implements no `Set`, `WeakRef`, iterator helpers or `async`. That is the point of the survey, not a failure of it.
