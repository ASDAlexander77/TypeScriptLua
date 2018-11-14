import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { Writable } from 'stream';
import { Handles, Source } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface LuaBreakpoint {
    id: number;
    line: number;
    verified: boolean;
}

export interface StartFrameInfo {
    index: number;
    name: string;
    file: string;
    line: number;
    column?: number;
    origin?: string;
}

export interface StartFrameInfos {
    count: number;
    frames: StartFrameInfo[];
}

export enum VariableTypes {
    Local,
    Global,
    Environment,
    SingleVariable
}

export function cleanUpPath(path: string) {
    if (path.charAt(1) === ':' && path.charAt(0).match('[A-Z]')) {
        path = path.charAt(0).toLowerCase() + path.substr(1);
    }

    return path.replace(/\\/g, '/');
}

class LuaCommands {
    constructor(private stdin: Writable) {
    }

    public async loadDebuggerSourceAsRequire() {
        await this.writeLineAsync(`require('./_debugger')`);
    }

    public async loadFile(path: string) {
        const debuggerLuaFilePath = path.replace(/\\/g, '/');
        await this.writeLineAsync('dofile(\'' + debuggerLuaFilePath + '\')');
        await this.flush();
    }

    public async pause() {
        await this.writeLineAsync(`pause('start', nil, true)`);
        await this.writeLineAsync(``);
        await this.flush();
    }

    public async setBreakpoint(line: number, column?: number, fileName?: string) {
        if (fileName) {
            const fileNameLowerCase = fileName.replace(/\\/g, '/').toLowerCase();
            await this.writeLineAsync(`setb ${line} ${fileNameLowerCase}`);
        }
        else {
            await this.writeLineAsync(`setb ${line}`);
        }

        await this.flush();
    }

    public async deleteBreakpoint(line: number, column?: number, fileName?: string) {
        if (fileName) {
            const fileNameLowerCase = fileName.replace(/\\/g, '/').toLowerCase();
            await this.writeLineAsync(`delb ${line} ${fileNameLowerCase}`);
        }
        else {
            await this.writeLineAsync(`delb ${line}`);
        }

        await this.flush();
    }

    public async run() {
        await this.writeLineAsync(`run`);
        await this.flush();
    }

    public async runWithoutPrint() {
        await this.writeLineAsync(`run`);
    }

    public async stepIn() {
        await this.writeLineAsync(`step`);
        await this.flush();
    }

    public async stepOut() {
        await this.writeLineAsync(`out`);
        ////await this.writeLineAsync(`show`);
        await this.flush();
    }

    public async stepOver() {
        await this.writeLineAsync(`over`);
        ////await this.writeLineAsync(`show`);
        await this.flush();
    }

    public async showSourceCode() {
        await this.writeLineAsync(`show`);
        await this.flush();
    }

    public async stack() {
        await this.writeLineAsync(`trace`);
        await this.flush();
    }

    public async dumpVariables(variableType: VariableTypes, variableName: string | undefined) {
        let vars;
        switch (variableType) {
            case VariableTypes.Local: vars = 'vars'; break;
            case VariableTypes.Global: vars = 'glob'; break;
            case VariableTypes.Environment: vars = 'fenv'; break;
            case VariableTypes.SingleVariable: vars = 'dump ' + variableName; break;
        }

        console.log("#: dump of " + vars);

        await this.writeLineAsync(vars);
        await this.flush();
    }

    private async flush() {
        await this.writeLineAsync(`print()`);
    }

    private async writeLineAsync(text: string, newLine: string = '\r\n', timeout: number = 1000) {
        return new Promise((resolve, reject) => {
            let timerId;

            this.stdin.write(text + newLine, () => {
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

    constructor(private program: string, private luaExecutable: string, private luaDebuggerFilePath: string) {
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

        const fileParse = /\s*no\sfile\s'(.*)\/_debugger.lua'/;
        exe.stderr.on('data', async (binary) => {
            const data = binary.toString();
            console.error("err: " + data);

            for (const line of data.split('\n')) {
                const values = fileParse.exec(line);
                if (values) {
                    if (!fs.existsSync(this.luaDebuggerFilePath)) {
                        console.error('!!! can\'t find file ./debugger/_debugger.lua');
                        console.error('Folder: ' + process.cwd());
                        break;
                    }

                    const folderPath = values[1];
                    if (fs.existsSync(folderPath)) {
                        // copy file
                        try {
                            fs.copySync(this.luaDebuggerFilePath, path.join(folderPath, '_debugger.lua'));
                            await this._commands.loadDebuggerSourceAsRequire();
                            break;
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
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

    public async step(type: StepTypes) {
        switch (type) {
            case StepTypes.Run:
                await this._commands.run();
                break;
            case StepTypes.In:
                await this._commands.stepIn();
                break;
            case StepTypes.Out:
                await this._commands.stepOut();
                break;
            case StepTypes.Over:
                await this._commands.stepOver();
                break;
        }

        const lastLine = await this.defaultProcessStage();
        return lastLine === ">";
    }

    public async setBreakpoint(path: string, line: number, column?: number) {
        // exclude CWD path from file
        const currentDir = cleanUpPath(process.cwd());
        if (path.startsWith(currentDir)) {
            path = path.substr(currentDir.length + 1);
        }

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

    public async stack(startFrame: number, endFrame: number): Promise<StartFrameInfos> {
        const parseLine = /(\[DEBUG\]\>\s)?\[(\d+)\](\*\*\*)?\s([^\s]*)\sin\s(.*)/;
        const parseFileNameAndLine = /(.*):(\d+)$/;

        await this._commands.stack();

        const frames = new Array<StartFrameInfo>();
        // every word of the current line becomes a stack frame.

        await this.defaultDebugProcessStage((line) => {
            // parse output
            const values = parseLine.exec(line);
            if (values) {
                const index = values[2];
                //const isActive = values[3];
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
                        frames.push(<StartFrameInfo>{
                            index: frames.length,
                            name: `${functionName}(${index})`,
                            file: fileName,
                            line: parseInt(locationValues[2])
                        });
                    }
                }
            }
        });

        return <StartFrameInfos>{
            frames: frames,
            count: frames.length
        };
    }

    public async dumpVariables(variableType: VariableTypes, variableName: string | undefined, variableHandles: Handles<string>) {
        let rootName = variableName;
        switch (variableType) {
            case VariableTypes.Local: rootName = "variables"; break;
            case VariableTypes.Global: rootName = "globals"; break;
            case VariableTypes.Environment: rootName = "environment"; break;
        }

        await this._commands.dumpVariables(variableType, rootName);

        const variableDeclatation = /(\s*)((([A-Za-z_0-9]+)|\.|\[[^\]]+\])+)\s*=\s*(.*)/;
        const endOfObject = /(\s*)}(;)?.*/;

        const variables = new Array<DebugProtocol.Variable>();

        let objects = new Array<any>();
        let paths = new Array<any>();
        let currentObject: any = {};
        await this.defaultDebugProcessStage((line) => {
            // parse output
            let values = variableDeclatation.exec(line);
            if (values) {
                const level = values[1].length;
                let name = values[2];
                let path = name;
                let value = values[5];
                const beginOfObject = value.startsWith('{');
                const nestedObject = !value.endsWith(';');
                const isRef = value.startsWith('ref\"');

                if (name.startsWith('[') && name.endsWith(']')) {
                    name = name.substr(1, name.length - 2);
                }

                if (isRef) {
                    value = value.substr(4, value.length - 6);
                }

                if (!nestedObject) {
                    value = value.substr(0, value.length - 1);
                }

                const isString = value.startsWith('\"');
                if (isString) {
                    value = value.substr(1, value.length - 2);
                }

                if (variableType === VariableTypes.SingleVariable && paths.length > 0) {
                    path = paths[paths.length - 1] + '.' + name;
                }

                if (beginOfObject) {
                    currentObject[name] = {
                        name,
                        level,
                        path,
                        value: {},
                        type: "object",
                    };

                    objects.push(currentObject);
                    paths.push(path);

                    currentObject = currentObject[name].value;
                } else {
                    let type = "any";
                    if (isString) {
                        type = "string";
                    } else {
                        // check if it is int or float
                        if (value.startsWith('table: ')) {
                            type = "object";
                        } else if (parseFloat(value) && value.indexOf('.') !== -1) {
                            type = "float";
                        }
                        else if (value === "0" || parseInt(value)) {
                            type = "int";
                        }
                        else if (value.startsWith('function: ')) {
                            type = "function";
                        }
                    }

                    currentObject[name] = {
                        name,
                        level,
                        path,
                        value,
                        type
                    };
                }
            } else {
                const end = endOfObject.exec(line);
                if (end) {
                    // end of object '};'
                    currentObject = objects.pop();
                    paths.pop();
                }
            }
        });

        if (rootName) {
            const values = currentObject[rootName].value;
            if (values) {
                for (let name in values) {
                    const value = values[name];
                    variables.push({
                        name: name,
                        type: value.type,
                        value: value.type === "object" ? "" : value.value,
                        variablesReference: value.type !== "object" ? 0 : variableHandles.create(
                            variableType === VariableTypes.SingleVariable
                                ? value.path
                                : name)
                    });
                }
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
enum StepTypes {
    Run,
    Over,
    In,
    Out
}

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
    public async start(program: string, stopOnEntry: boolean, luaExecutable: string, luaDebuggerFilePath: string) {

        this._sourceFile = cleanUpPath(program);

        this._luaExe = new LuaSpawnedDebugProcess(this._sourceFile, luaExecutable, luaDebuggerFilePath);
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
            await this.stepIn('stopOnEntry');
        } else {
            // we just start to run until we hit a breakpoint or an exception
            await this.continue();
        }
    }

    public get breakPoints(): Map<string, LuaBreakpoint[]> {
        return this._breakPoints;
    }

	/**
	 * Continue execution to the end/beginning.
	 */
    public async continue(event = 'stopOnBreakpoint') {
        await this.stepInternal(StepTypes.Run, event);
    }

	/**
	 * Step in
	 */
    public async stepOver(event = 'stopOnStep') {
        await this.stepInternal(StepTypes.Over, event);
    }

	/**
	 * Step in
	 */
    public async stepIn(event = 'stopOnStep') {
        await this.stepInternal(StepTypes.In, event);
    }

	/**
	 * Step out
	 */
    public async stepOut(event = 'stopOnStep') {
        await this.stepInternal(StepTypes.Out, event);
    }

	/**
	 * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
	 */
    public async stack(startFrame: number, endFrame: number): Promise<StartFrameInfos> {
        return await this._luaExe.stack(startFrame, endFrame);
    }

    public async dumpVariables(variableType: VariableTypes, variableName: string | undefined, variableHandles: Handles<string>) {
        return await this._luaExe.dumpVariables(variableType, variableName, variableHandles);
    }

	/*
	 * Set breakpoint in file with given line.
	 */
    public async setBreakPoint(filePath: string, line: number) {

        const path = cleanUpPath(filePath);

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

        const path = cleanUpPath(filePath);

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

    private async stepInternal(type: StepTypes, stepEvent?: string) {
        if (await this._luaExe.step(type)) {
            this.sendEvent('end');
            return;
        }

        if (stepEvent) {
            this.sendEvent(stepEvent);
        }
    }

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }
}