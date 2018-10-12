import { spawn } from 'child_process';
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
    let line;
    let debuggerloading: boolean;
    let debuggerloaded: boolean;
    let fileloading: boolean;
    let fileloaded: boolean;
    while (line = await readOutput(exe.stdout, 3000)) {
        console.log(line);
        line.split('\n').forEach(newLine => {
            if ((!debuggerloading && !debuggerloaded) && newLine === '> ') {
                debuggerloading = true;
                exe.stdin.write(`require('./debugger')\n`);
            }

            if (debuggerloading && newLine.startsWith('true')) {
                debuggerloaded = true;

                exe.stdin.write(`pause()\n`);
                exe.stdin.write(`\n`);
            }

            if (debuggerloaded && newLine.startsWith('[DEBUG]>')) {
                exe.stdin.write(`setb 1\n`);
                exe.stdin.write(`run\n`);
            }

            if (debuggerloaded && !fileloading && !fileloaded) {
                fileloading = true;
                exe.stdin.write(`dofile('C:/Temp/TypeScriptLUA/vscode-lua-debug/test/file.lua')\n`);
                fileloaded = true;
            }
        });
    }

    exe.kill();

    console.log('end...');
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

        output.on('error', () => {
            if (timerId) {
                clearTimeout(timerId);
            }

            resolve(undefined);
        });

        if (timeout) {
            timerId = setTimeout(() => resolve(undefined), timeout);
        }
    });
}

f();

