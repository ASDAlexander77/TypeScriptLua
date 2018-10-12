import { spawn } from 'child_process';
import { Readable, Writable } from 'stream';

async function f() {
    console.log('start...');

    const exe = spawn('lua', [
        //'-e', 'require(\'./debugger\')',
        //'-e', 'pause()',
        //'-e', 'dofile(\'C:/Temp/TypeScriptLUA/vscode-lua-debug/test/file.lua\')',
        '-i'
    ]);

    exe.on('close', (code) => {
        console.log(`process exited with code ${code}`);
    });

    exe.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    exe.stdout.setEncoding('utf8');

    try {
        /*
        await processStagesAsync(exe.stdout, [
            {
                text: '>', action: async () => {
                    await writeLineAsync(exe.stdin, `require('./debugger')`);
                }
            },
            {
                text: 'true', action: async () => {
                    await writeLineAsync(exe.stdin, `pause()`);
                    await writeLineAsync(exe.stdin, ``);
                }
            },
            {
                text: '[DEBUG]>', action: async () => {
                    await writeLineAsync(exe.stdin, `setb 1`);
                    await writeLineAsync(exe.stdin, `run`);
                }
            },
            {
                text: '>', action: async () => {
                    await writeLineAsync(exe.stdin, `dofile('C:/Temp/TypeScriptLUA/vscode-lua-debug/test/file.lua')`);
                }
            }
        ]);
        */

        await processStagesAsync(exe.stdout, [
            {
                text: '>', action: async () => {
                    await writeLineAsync(exe.stdin, `require('./debugger')`);
                    await writeLineAsync(exe.stdin, `print(1)`);
                }
            },
            {
                text: 'true', action: async () => {
                    await writeLineAsync(exe.stdin, `print(1)`);
                }
            },
            {
                text: '1', action: async () => {
                    await writeLineAsync(exe.stdin, `print(2)`);
                }
            },
            {
                text: '2', action: async () => {
                    await writeLineAsync(exe.stdin, `pause()`);
                    await writeLineAsync(exe.stdin, ``);
                    await writeLineAsync(exe.stdin, `print(3)`);
                }
            },
            {
                text: '3', action: async () => {
                    await writeLineAsync(exe.stdin, `print(4)`);
                }
            },
            {
                text: '', action: async () => {
                    await writeLineAsync(exe.stdin, `print(5)`);
                }
            }
        ]);
    } catch (e) {
        console.error(e);
    }

    exe.kill();

    console.log('end...');
}

async function processStagesAsync(output: Readable, stages: { text: string, action: () => Promise<void> }[]) {
    let stageNumber;
    let stage = stages[stageNumber = 0];

    let line;
    while (line = await readAsync(output)) {
        for (const newLine of line.split('\n')) {
            const data = newLine.trim();
            console.log('>: ' + data);
            if (data === stage.text) {
                console.log('#: match [' + data + '] acting...');
                await stage.action();
                stage = stages[++stageNumber];
                if (!stage) {
                    console.log('#: no more actions...');
                    return;
                }
            }
        }
    }
}

async function readAsync(output: Readable, timeout: number = 3000) {
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
            timerId = setTimeout(() => reject('read timeout'), timeout);
        }
    });
}

async function writeLineAsync(instream: Writable, text: string, timeout: number = 1000) {
    return new Promise((resolve, reject) => {
        let timerId;

        instream.write(text + '\n', () => {
            if (timerId) {
                clearTimeout(timerId);
            }

            resolve();
        });

        if (timeout) {
            timerId = setTimeout(() => reject('write timeout'), timeout);
        }
    });
}

f();

