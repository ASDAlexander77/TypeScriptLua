import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { Writable, Readable } from 'stream';

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
        let line;
        while (line = await readOutput(exe.stdout, 3000)) {
            console.log(line);
        }
    } catch (e) {
        console.error(e);
    }

    exe.kill();

    console.log('end...');
}

async function readOutput(output: Readable, timeout?: number) {
    return new Promise((resolve, reject) => {
        output.on('data', (data) => resolve(data));
        output.on('error', () => resolve(undefined));
        if (timeout) {
            setTimeout(() => reject(new Error('timeout')), timeout);
        }
    });
}

f();

