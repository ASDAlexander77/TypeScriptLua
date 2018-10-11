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
    while (line = await readOutput(exe.stdout, 3000)) {
        console.log(line);
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

