# A conformance suite for jslib, built from the TypeScriptCompilerDefaultLib tests

Date: 2026-08-07
Status: approved, ready for planning

## Problem

`experiments/jslib` is the standard library the `-jslib` runtime provides — `String`,
`Array`, `Date`, `RegExp`, `Math`, `console` — and almost nothing tests whether it agrees
with JavaScript.

`spec/` has 244 tests, but they target the *emitter*: they assert on the shape of the
generated Lua, or run a few lines and compare a literal expected string. `spec/jslib.spec.ts`
uses `testEmit` only — it never executes jslib. Nothing anywhere compares jslib's behaviour
against a real JavaScript engine.

The cost of that gap is not theoretical. Three defects found by hand in one debugging
session, all of which a behavioural suite would have caught:

- `StringHelper.replace` reassembled its result with `Array.join()`, inserting the default
  `','` between every fragment, so `#include<__decl__defaultVertex>` resolved to
  `,default,UboDeclaration`.
- `RegExp.exec` was declared to return `any`, which silently degraded every `match[n]` to
  `any` and made the emitter produce dynamic method calls that fail at runtime.
- `__new` treated the `undefined` sentinel as a constructor, so every class without a
  constructor threw on instantiation.

A fourth is still open, found in thirty seconds while validating the approach for this
document: `"I think Ruth's dog is cuter than your dog!".replace(/Dog/i, "ferret")` replaces
**both** occurrences under jslib. Node replaces only the first — the regex is not global.

## The opportunity

`I:\TypeScriptCompilerDefaultLib\tests` holds 150 `.ts` conformance tests for the MLIR
TypeScript compiler, covering exactly the surface jslib implements: 40 date, 34 array, 31
string, 13 map, 10 iterator, 8 set, 6 regexp, 1 math, and 7 miscellaneous. They are ordinary
TypeScript exercising standard library behaviour, so they are equally valid as jslib tests.

Two properties of the upstream harness matter here:

- It only greps stdout for an `ALL DONE` marker. The `// Expected output:` comments
  scattered through the files are documentation and are never machine-checked.
- 57 of the 150 files wrap their body in `function main()` and never call it — the MLIR
  compiler invokes `main` as the program entry point. Compiled to Lua, those files would
  emit a function nobody calls, print nothing, and test nothing.

So the tests are a good source of *cases*, but the upstream pass criterion is too weak to
adopt, and the files need a transform before they will run at all outside MLIR.

## Goal

Stage 1, and the subject of this document: a survey tool that runs all 150 tests against
jslib, diffs each against Node, and reports where jslib and JavaScript disagree. The report
is both a gap analysis and the raw material for stage 2.

Stage 2, outlined here and designed properly once the numbers are in: promote the passing
tests into a permanent regression suite.

## Design

### Oracle

For each test, capture stdout twice — once from Node, once from `tsc-lua` + `lua.exe` — and
compare. Node is the ground truth.

This is chosen over the upstream `ALL DONE` criterion because only 71 of the 150 files call
`assert`; the other 79 would pass merely by not crashing, and wrong-but-non-crashing output
is precisely the failure mode of the bugs listed above. It is chosen over hand-written
expected values because those rot, and because 150 files of them is a lot of typing that
Node will do for free.

### Layout

```text
spec/conformance/
  tests/*.ts        vendored snapshot — never edited
  PROVENANCE.md     upstream path, snapshot date, refresh instructions
  REPORT.md         generated
scripts/
  refresh-conformance.ts   re-copy from I:\TypeScriptCompilerDefaultLib\tests
  conformance-survey.ts    the runner
```

The tests are vendored rather than read across drives so the suite is reproducible on a
machine that has only this repo, and so an upstream edit cannot turn the suite red with no
commit here. `scripts/` follows the existing `build-jslib-dts.ts` convention.

Entry point: `npm run conformance`.

### Per-test pipeline

Each test runs in its own temporary work directory containing a fresh copy of
`experiments/jslib/JS.lua`. The copy is required: the emitted Lua contains
`require("./JS")` resolved relative to itself.

The vendored file is never modified. Three transforms are applied to a copy:

1. Prepend `import './JS';`. Without it the emitted Lua defines no `console`, `String` or
   `Array`, and dies on the first line with `attempt to index a nil value (global 'console')`.
2. Prepend an `assert` shim if the file calls `assert(` and does not define it — 71 files.
   The shim throws on a falsy first argument.
3. Append `main();` if the file declares `function main(` and never calls it — 57 files.

Transforms 2 and 3 are applied to the Node run as well, so both sides execute the same test
body. Transform 1 is Lua-only — `./JS` is a Lua module and means nothing to Node, which gets
its standard library from the engine.

### Console formatting

jslib's `console.log` does not format the way Node's does:

| | jslib | Node |
| --- | --- | --- |
| multiple arguments | `str<TAB>1<TAB>true` | `str 1 true` |
| arrays | `Fire,Air,Water` | `[ 'Fire', 'Air', 'Water' ]` |

67 of the 150 files log either multiple arguments or a bare identifier — an upper bound on
how many this affects, since an identifier holding a string formats identically. Left alone,
much of that set would be reported as differing because of the printer rather than because
of the behaviour under test, burying the real findings.

Resolution: adapt the **Node** side down to jslib's format, via a small `--require` preload
that overrides `console.log` with jslib's rules. The alternative — reimplementing Node's
`inspect` inside jslib — is a much larger job for a formatter nothing depends on.

The deviation is not thereby ignored. It is recorded once in the report as a finding in its
own right, so the decision to normalise it stays visible.

### Determinism

Every test runs under Node twice. If the two runs disagree, the test is classified
`NONDET` and excluded. This catches the date tests that print the current time — a subset of
the 40, since some use fixed inputs — with no hand-maintained skip list, and it keeps
working when upstream adds more.

Each run is capped at 20 seconds.

### Result categories

| Category | Meaning |
| --- | --- |
| `MATCH` | Lua stdout equals Node stdout |
| `DIFF` | Both ran, outputs differ — a jslib behaviour bug |
| `LUA_CRASH` | `lua.exe` errored or timed out |
| `LUA_COMPILE_FAIL` | `tsc-lua` threw, or emitted nothing |
| `NODE_FAIL` | Test does not run under Node either — excluded, not a jslib finding |
| `NONDET` | Node output not reproducible — excluded |

`REPORT.md` contains a summary table by category, a per-category file listing, and a unified
diff for every `DIFF` entry. `DIFF` is the actionable list; `LUA_COMPILE_FAIL` is the
missing-feature list.

The survey is a reporting tool and always exits 0. It does not gate `npm test`.

## Stage 2 (outline)

Once the numbers are known: `spec/conformance.spec.ts` iterates the vendored tests and skips
those named in a checked-in `known-failures.json`, seeded from the stage-1 report. The suite
is green on adoption, each jslib fix deletes an entry, and a new regression turns it red.

Designed properly after stage 1 — the hit rate determines whether this is worth the
machinery or whether a handful of targeted specs would serve better.

## Out of scope

- Editing the vendored tests. They are a snapshot; fixes belong upstream.
- Gating `npm test` on the survey.
- Special handling for the iterator, `Set`, `WeakRef` and `async` tests. They will land in
  `LUA_COMPILE_FAIL`, which is the useful signal — jslib does not implement them.
- Fixing any jslib bug the survey finds. The survey's output is a list; acting on it is
  separate work.
