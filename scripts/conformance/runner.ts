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
// artifact of the last print rather than content
function normalize(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line: string) => line.replace(/\s+$/, ''))
        .join('\n')
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

    // the compiler matches this argument against ts.SourceFile.fileName, which the
    // TypeScript API always normalizes to forward slashes; a Windows backslash path
    // therefore matches nothing, and the compiler silently emits no .lua file with exit 0
    const compile = exec(process.execPath, [TSC_LUA, '-jslib', tsFile.replace(/\\/g, '/')], workDir);
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
        if (!second.ok || nodeOut !== normalize(second.stdout)) {
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
        fs.removeSync(workDir);
    }
}
