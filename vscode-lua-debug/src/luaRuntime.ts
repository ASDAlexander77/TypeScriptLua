import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { Writable } from 'stream';
import { DebugProtocol } from 'vscode-debugprotocol';

export interface LuaBreakpoint {
	id: number;
	line: number;
	verified: boolean;
}

export enum VariableTypes {
    Local,
    Up,
    Global,
    All
}

class LuaCommands {
	constructor(private stdin: Writable) {
	}

	public async loadDebuggerSourceAsRequire() {
		await this.writeLineAsync(this.stdin, `require('./debugger')`);
	}

	public async loadFile(path: string) {
		const debuggerLuaFilePath = path.replace(/\\/g, '/');
		await this.writeLineAsync(this.stdin, 'dofile(\'' + debuggerLuaFilePath + '\')');
		await this.writeLineAsync(this.stdin, `print()`);
	}

	public async pause() {
		await this.writeLineAsync(this.stdin, `pause('start', nil, true)`);
		await this.writeLineAsync(this.stdin, ``);
		await this.writeLineAsync(this.stdin, `print()`);
	}

	public async setBreakpoint(line: number, column?: number, fileName?: string) {
        if (fileName) {
            const fileNameLowerCase = fileName.replace(/\\/g, '/').toLowerCase();
            await this.writeLineAsync(this.stdin, `setb ${line} ${fileNameLowerCase}`);
        }
        else {
            await this.writeLineAsync(this.stdin, `setb ${line}`);
        }

		await this.writeLineAsync(this.stdin, `print()`);
    }

	public async deleteBreakpoint(line: number, column?: number, fileName?: string) {
        if (fileName) {
            const fileNameLowerCase = fileName.replace(/\\/g, '/').toLowerCase();
            await this.writeLineAsync(this.stdin, `delb ${line} ${fileNameLowerCase}`);
        }
        else {
            await this.writeLineAsync(this.stdin, `delb ${line}`);
        }

		await this.writeLineAsync(this.stdin, `print()`);
	}

	public async run() {
		await this.writeLineAsync(this.stdin, `run`);
		await this.writeLineAsync(this.stdin, `print()`);
	}

	public async runWithoutPrint() {
		await this.writeLineAsync(this.stdin, `run`);
	}

	public async step() {
		await this.writeLineAsync(this.stdin, `step`);
		////await this.writeLineAsync(this.stdin, `show`);
		await this.writeLineAsync(this.stdin, `print()`);
	}

	public async showSourceCode() {
		await this.writeLineAsync(this.stdin, `show`);
		await this.writeLineAsync(this.stdin, `print()`);
    }

	public async stack() {
		await this.writeLineAsync(this.stdin, `trace`);
		await this.writeLineAsync(this.stdin, `print()`);
    }

    public async dumpVariables(variableType: VariableTypes) {
        let vars = 'vars'
        switch (variableType) {
            case VariableTypes.Local: vars = 'locs'; break;
            case VariableTypes.Up: vars = 'ups'; break;
            case VariableTypes.Global: vars = 'glob'; break;
            case VariableTypes.Local: break;
        }

		await this.writeLineAsync(this.stdin, vars);
		await this.writeLineAsync(this.stdin, `print()`);
    }

	async writeLineAsync(instream: Writable, text: string, newLine: string = '\r\n', timeout: number = 1000) {
		return new Promise((resolve, reject) => {
			let timerId;

			instream.write(text + newLine, () => {
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
}

class LuaSpawnedDebugProcess {
	private _commands: LuaCommands;
	private exe: ChildProcess;

	constructor(private program: string, private stopOnEntry: boolean, private luaExecutable: string) {
	}

	public async spawn() {
		const exe = this.exe = spawn(this.luaExecutable, [
			/*
			'-e', 'require(\'./debugger\')',
			'-e', 'pause()',
			'-e', 'dofile(\'C:/Temp/TypeScriptLUA/vscode-lua-debug/test/file.lua\')',
			*/
			'-i'
		]);

		this._commands = new LuaCommands(exe.stdin);

		exe.on('close', (code) => {
			console.log(`process exited with code ${code}`);
		});

		exe.on('exit', (code) => {
			console.log(`process exited with code ${code}`);
		});

		exe.stderr.on('data', (data) => {
			console.error(data.toString());
		});

		exe.stdout.setEncoding('utf8');

		try {
			await this.processStagesAsync([
				{
					text: '>', action: async () => {
						await this._commands.loadDebuggerSourceAsRequire();
					}
				},
				{
					text: 'true', action: async () => {
						await this._commands.pause();
					}
				},
				{
					text: '[DEBUG]>', action: async () => {
						await this._commands.setBreakpoint(1);
					}
				},
				{
					text: '[DEBUG]>', action: async () => {
						await this._commands.runWithoutPrint();
					}
				},
				{
					text: '', action: async () => {
						await this._commands.loadFile(this.program);
					}
				},
				/*
				{
					text: '[DEBUG]>', action: async () => {
						await this._commands.step();
					}
				},
				{
					text: '[DEBUG]>', action: async () => {
						await this._commands.showSourceCode();
					}
				},
				*/
				{
					text: '[DEBUG]>', action: undefined
				}
			]);
		} catch (e) {
			console.error(e);
		}

		console.log(">>> the app is spawed");
	}

	public async step() {
		await this._commands.step();
        const lastLine = await this.defaultProcessStage();
        return lastLine === ">";
    }

	public async run() {
		await this._commands.run();
        const lastLine = await this.defaultProcessStage();
        return lastLine === ">";
    }

    public async setBreakpoint(path: string, line: number, column?: number) {
        let success;
        await this._commands.setBreakpoint(line, column, path);
		await this.defaultDebugProcessStage((line) => {
            success = /\[DEBUG\]>\sBreakpoint\sset\sin\sfile.*/.test(line);
        });

        return success;
    }

    public async deleteBreakpoint(path: string, line: number, column?: number) {
        let success;
        await this._commands.deleteBreakpoint(line, column, path);
		await this.defaultDebugProcessStage((line) => {
            success = /\[DEBUG\]>\sBreakpoint\sdeleted\sfrom\sfile.*/.test(line);
        });

        return success;
    }

	public async stack(startFrame: number, endFrame: number) {
        const parseLine = /(\[DEBUG\]\>\s)?\[(\d+)\](\*\*\*)?\s([^\s]*)\sin\s(.*)/;
        const parseFileNameAndLine = /(.*):(\d+)$/;

        await this._commands.stack();

		const frames = new Array<any>();
		// every word of the current line becomes a stack frame.

		await this.defaultDebugProcessStage((line) => {
            // parse output
			const values = parseLine.exec(line);
			if (values) {
				const index = values[2];
				const isActive = values[3];
				const functionName = values[4];
                const location = values[5];

                const locationValues = parseFileNameAndLine.exec(location);
                if (locationValues) {
                    const locationWithoutLine = locationValues[1];
                    const startIndex =
                            (locationWithoutLine.length > 2 && locationWithoutLine[1] === ':' && (locationWithoutLine[2] === '\\' || locationWithoutLine[2] === '/'))
                                ? 3
                                : 0;
                    const fileIndex = locationWithoutLine.indexOf(':', startIndex);
                    const fileName = fileIndex === -1 ? locationWithoutLine : locationWithoutLine.substring(0, fileIndex);

                    if (fileName !== "stdin" && fileName !== "C") {
                        frames.push({
                            index: frames.length,
                            name: `${functionName}(${index})`,
                            file: fileName,
                            line: parseInt(locationValues[2])
                        });
                    }
                }
            }
        });

        return {
			frames: frames,
			count: frames.length
		};
	}

	public async dumpVariables(variableType: VariableTypes) {
        await this._commands.dumpVariables(variableType);

        let rootName = "variables";
        switch (variableType) {
            case VariableTypes.Local: rootName = "upvalues"; break;
            case VariableTypes.Up: rootName = "upvalues"; break;
            case VariableTypes.Global: rootName = "globals"; break;
        }

        const variableDeclatation = /(\s*)([A-Za-z_]+)\s*=\s*(.*)/;
        const endOfObject = /(\s*)}(;)?.*/;

        const variables = new Array<DebugProtocol.Variable>();

        let objects = new Array<any>();
        let currentObject: any = {};
		await this.defaultDebugProcessStage((line) => {
            // parse output
			const values = variableDeclatation.exec(line);
			if (values) {
                const level = values[1].length;
                const name = values[2];
                const value = values[3];
                const beginOfObject = value.startsWith('{');

                if (beginOfObject) {
                    currentObject[name] = {
                        level,
                        value: {},
                        type: "object"
                    };

                    objects.push(currentObject);

                    currentObject = currentObject[name].value;
                } else {
                    currentObject[name] = {
                        level,
                        value,
                        type: "object"
                    };
                }
            } else {
                const end = endOfObject.exec(line);
                if (end) {
                    // end of object '};'
                    currentObject = objects.pop();
                }
            }
        });

        const values = currentObject[rootName].value;
        if (values) {
            for (let name in values) {
                const value = values[name];
                variables.push({
                    name: name,
                    type: value.type,
                    value: value.value,
                    variablesReference: 0
                });
            }
        }

        return variables;
	}

	private async defaultDebugProcessStage(defaultAction?: Function) {
		try {
			return await this.processStagesAsync([
                {
                    text: '[DEBUG]>', action: undefined
                }
            ],
            defaultAction);
		}
		catch (e) {
			console.error(e);
		}
    }

	private async defaultProcessStage(defaultAction?: Function) {
		try {
			return await this.processStagesAsync([
                {
                    text: ['[DEBUG]>', '>'], action: undefined
                }
            ],
            defaultAction);
		}
		catch (e) {
			console.error(e);
		}
	}

	async processStagesAsync(stages: { text: string | string[], action: (() => Promise<void>) | undefined }[], defaultAction?: Function | undefined) {
		let stageNumber;
		let stage = stages[stageNumber = 0];

        const isArray = stage.text instanceof Array;

		let line;
		while (line = await this.readAsync()) {
			for (const newLine of line.split('\n')) {
				const data = newLine.trim();
                console.log('>: ' + data);

                if (defaultAction) {
                    defaultAction(data);
                }

                const process = isArray ? (<string[]>stage.text).some(v => v === data) : data === stage.text;
                if (process) {
					console.log('#: match [' + data + '] acting...');
					if (stage.action) {
						await stage.action();
					}

					stage = stages[++stageNumber];
					if (!stage) {
						console.log('#: no more actions...');
						return data;
					}
                }
			}
		}
	}

	async readAsync(timeout: number = 3000) {
		return new Promise((resolve, reject) => {
			let timerId;
			this.exe.stdout.on('data', (data) => {
				if (timerId) {
					clearTimeout(timerId);
				}

				resolve(data);
			});

			this.exe.stdout.on('error', (e) => {
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
}

/**
 * A lua runtime with minimal debugger functionality.
 */
export class LuaRuntime extends EventEmitter {

	// the initial (and one and only) file we are 'debugging'
	private _sourceFile: string;
	public get sourceFile() {
		return this._sourceFile;
	}

	// maps from sourceFile to array of Mock breakpoints
	private _breakPoints = new Map<string, LuaBreakpoint[]>();

	// since we want to send breakpoint events, we will assign an id to every event
	// so that the frontend can match events with breakpoints.
	private _breakpointId = 1;

	private _luaExe: LuaSpawnedDebugProcess;

	constructor() {
		super();
	}

	/**
	 * Start executing the given program.
	 */
	public async start(program: string, stopOnEntry: boolean, luaExecutable: string) {

        this._sourceFile = this.cleanUpFile(program);

		this._luaExe = new LuaSpawnedDebugProcess(this._sourceFile, stopOnEntry, luaExecutable);
		await this._luaExe.spawn();

        // TODO: finish it, dummy verification of breakpoints
        const bps = this._breakPoints.get(this._sourceFile);
        if (bps) {
            for (const bp of bps) {
                await this._luaExe.setBreakpoint(this._sourceFile, bp.line);
            }
        }

		if (stopOnEntry) {
			// we step once
			await this.step(false, 'stopOnEntry');
		} else {
			// we just start to run until we hit a breakpoint or an exception
			await this.continue();
		}
	}

	/**
	 * Continue execution to the end/beginning.
	 */
	public async continue(reverse = false, event = 'stopOnBreakpoint') {
		await this.runInternal(reverse, event);
	}

	/**
	 * Step to the next/previous non empty line.
	 */
	public async step(reverse = false, event = 'stopOnStep') {
		await this.stepInternal(reverse, event);
	}

	/**
	 * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
	 */
	public async stack(startFrame: number, endFrame: number) {
        return await this._luaExe.stack(startFrame, endFrame);
	}

    public async dumpVariables(variableType: VariableTypes) {
        return await this._luaExe.dumpVariables(variableType);
    }

	/*
	 * Set breakpoint in file with given line.
	 */
	public async setBreakPoint(filePath: string, line: number) {

        const path = this.cleanUpFile(filePath);

		const bp = <LuaBreakpoint>{ verified: false, line, id: this._breakpointId++ };
		let bps = this._breakPoints.get(path);
		if (!bps) {
			bps = new Array<LuaBreakpoint>();
			this._breakPoints.set(path, bps);
        }

		bps.push(bp);

        // verify breakpoint
        this.verifyBreakpoint(bp, path);
        if (this._luaExe) {
            await this._luaExe.setBreakpoint(path, bp.line);
        }

		return bp;
	}

    private verifyBreakpoint(bp: LuaBreakpoint, path: string) {
        bp.verified = true;
        this.sendEvent('breakpointValidated', bp);
    }

	/*
	 * Clear breakpoint in file with given line.
	 */
	public async clearBreakPoint(filePath: string, line: number) {

        const path = this.cleanUpFile(filePath);

		let bps = this._breakPoints.get(path);
		if (bps) {
			const index = bps.findIndex(bp => bp.line === line);
			if (index >= 0) {
				const bp = bps[index];
                bps.splice(index, 1);

                if (this._luaExe) {
                    await this._luaExe.deleteBreakpoint(path, bp.line);
                }

				return bp;
			}
        }

		return undefined;
	}

	/*
	 * Clear all breakpoints for file.
	 */
	public clearBreakpoints(path: string): void {
		this._breakPoints.delete(path);
	}

    private cleanUpFile(path: string) {
        return path.replace(/\\/g, '/');
    }

	private async stepInternal(reverse: boolean, stepEvent?: string) {
        if (await this._luaExe.step()) {
            this.sendEvent('end');
            return;
        }

        if (stepEvent) {
            this.sendEvent(stepEvent);
        }
    }

	/**
	 * Run through the file.
	 * If stepEvent is specified only run a single step and emit the stepEvent.
	 */
	private async runInternal(reverse: boolean, runEvent?: string) {
        if (await this._luaExe.run()) {
            this.sendEvent('end');
            return;
        }

        if (runEvent) {
            this.sendEvent(runEvent);
        }
	}

	private sendEvent(event: string, ...args: any[]) {
		setImmediate(_ => {
			this.emit(event, ...args);
		});
	}
}