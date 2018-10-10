import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { Writable, Readable } from 'stream';

async function f() {
    console.log('start...');

    const exe = spawn('lua', ['-i']);
    // const exe = spawn('dir', ['*.*'], { shell: true });

    exe.stdout.setEncoding('utf8');

    let line;
    while (line = await readOutput(exe.stdout)) {
        console.log(line);
    }


    /*
    exe.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(text);
    });

    exe.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    exe.on('exit', (code) => {
        console.log(`process exited with code ${code}`);
    });
    */

    console.log('end...');
}

async function readOutput(output: Readable) {
    return new Promise((resolve, reject) => {
        output.on('data', (data) => resolve(data));
        output.on('error', () => resolve(undefined));
    });
}

f();
