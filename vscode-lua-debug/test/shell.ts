import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';

async function f() {
    console.log('start...');

    const exe = spawn('lua', ['-i']);

    exe.on('close', (code) => {
        console.log(`process exited with code ${code}`);
    });

    exe.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    exe.stdout.setEncoding('utf8');

    try {
        await processStage(exe, '> ', () => {
            exe.stdin.write(`require('./debugger')\n`);
        });

        await processStage(exe, 'true', () => {
            exe.stdin.write(`pause()\n`);
            exe.stdin.write(`\n`);
        });

        await processStage(exe, '[DEBUG]>', () => {
            exe.stdin.write(`setb 1\n`);
            exe.stdin.write(`run\n`);
        });

        await processStage(exe, '> ', () => {
            exe.stdin.write(`dofile('C:/Temp/TypeScriptLUA/vscode-lua-debug/test/file.lua')\n`);
        });
    } catch (e) {
        console.error(e);
    }

    exe.kill();

    console.log('end...');
}

async function processStage(exe: ChildProcess, expecting: string, action: Function) {
    let line;
    while (line = await readOutput(exe.stdout, 3000)) {
        console.log(line);
        line.split('\n').forEach(newLine => {
            if (newLine.trim() === expecting) {
                action();
            }
        });
    }
}

async function readOutput(output: Readable, timeout?: number) {
    return new Promise((resolve, reject) => {
        let timerId;
        output.on('data', (data) => {
            if (timerId) {
                clearTimeout(timerId);
            }

            resolve(data);
        });

        output.on('error', (e) => {
            if (timerId) {
                clearTimeout(timerId);
            }

            reject(e);
        });

        if (timeout) {
            timerId = setTimeout(() => reject('timeout'), timeout);
        }
    });
}

f();

