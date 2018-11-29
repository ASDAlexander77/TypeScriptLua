import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { Writable } from 'stream';
import { Handles } from 'vscode-debugadapter';
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

export function excludeRootPath(path: string, rootPath: string) {
    if (path.startsWith(rootPath)) {
        return path.substr(rootPath.length + ((rootPath[rootPath.length - 1] === '\\' || rootPath[rootPath.length - 1] === '/') ? 0 : 1));
    }

    return path;
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

        console.log("#: dump - " + vars);

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

class LuaSpawnedProcess extends EventEmitter {
    constructor(private program: string, private luaExecutable: string) {
        super();
    }

    public async spawn() {
        const exe = spawn(this.luaExecutable, [
            this.program
        ]);

        exe.on('close', (code) => {
            console.log(`process exited with code ${code}`);
            this.sendEvent('end', code);
        });

        exe.on('exit', (code) => {
            console.log(`process exited with code ${code}`);
            this.sendEvent('end', code);
        });

        exe.stderr.on('data', async (data) => {
            this.sendEvent('errorData', data.toString());
        });

        exe.stdout.on('data', async (data) => {
            this.sendEvent('outputData', data.toString());
        });

        exe.stdout.setEncoding('utf8');

        ////await commands.loadFile(this.program);
    }

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }
}

class LuaSpawnedDebugProcess extends EventEmitter {
    private _commands: LuaCommands;
    private _exe: ChildProcess;
    private _lastError: string | null;
    private _lastErrorStack: string | null;
    private _errorOutputInProgress: boolean;
    private _frames: StartFrameInfo[] | null;
    private _errorFrames: StartFrameInfo[] | null;

    constructor(private program: string, private luaExecutable: string, private luaDebuggerFilePath: string) {
        super();
    }

    public installDebuggerIfDoesNotExist(folderPath: string): boolean {
        if (!fs.existsSync(this.luaDebuggerFilePath)) {
            console.error('!!! can\'t find file ./debugger/_debugger.lua');
            console.error('Folder: ' + process.cwd());
            return false;
        }

        if (fs.existsSync(folderPath)) {
            // copy file
            try {
                fs.copySync(this.luaDebuggerFilePath, path.join(folderPath, '_debugger.lua'));
                return true;
            }
            catch (e) {
                console.error(e);
            }
        }

        return false;
    }

    public get HasErrorReadingInProgress(): boolean {
        return (this._errorOutputInProgress) ? true : false;
    }

    public get HasError(): boolean {
        return (this._lastErrorStack) ? true : false;
    }

    public get LastError(): string | null {
        return this._lastError;
    }

    public get LastErrorStack(): string | null {
        return this._lastErrorStack;
    }

    public dropStackTrace(): void {
        this._frames = null;
    }

    public async spawn() {
        const exe = this._exe = spawn(this.luaExecutable, [
            '-i'
        ]);

        this._commands = new LuaCommands(exe.stdin);

        exe.on('close', (code) => {
            console.log(`process exited with code ${code}`);
        });

        exe.on('exit', (code) => {
            console.log(`process exited with code ${code}`);
        });

        let stackTrace;
        let stackReading = false;
        let notProcessedErrorData = '';

        exe.stderr.on('data', async (binary) => {
            this._errorOutputInProgress = true;

            let data = notProcessedErrorData + binary.toString();
            notProcessedErrorData = '';

            this.sendEvent('errorData', data);

            const indexOfCompleteData = data.lastIndexOf('\n');
            if (indexOfCompleteData >= 0) {
                // not complete data;
                notProcessedErrorData = data.substr(indexOfCompleteData + 1);
                data = data.substr(0, indexOfCompleteData + 1);
                console.error("err: " + data);

                // process error data
                // first line is error message
                if (!stackReading) {
                    const index = data.indexOf('\n');
                    const msg = data.substr(0, index + 1);

                    stackReading = true;
                    // rest of data
                    data = data.substr(index + 1);

                    this._errorFrames = null;
                    this._lastError = msg;
                }

                // stack trace
                if (stackReading) {
                    stackTrace += data;
                    if (data.indexOf('[C]: in ?') >= 0) {
                        // end of stack
                        this._errorOutputInProgress = false;
                        stackReading = false;
                        this._lastErrorStack = stackTrace;
                        this.sendEvent('error', this._lastError);
                    }
                }
            } else {
                notProcessedErrorData = data;
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

        const lastLine = await this.defaultProcessStage((data) => {
            const line = data.toString();
            const debugStart = line.startsWith('[DEBUG]>');
            const pause = line.startsWith('[DEBUG]> Paused at');
            if (!pause) {
                this.sendEvent('outputData', (debugStart ? line.substr(9) : line) + '\n');
            }
        });
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
        if (!this._frames) {
            const parseLine = /(\[DEBUG\]\>\s)?(\[(\d+)\])?(\*\*\*)?\s+([^\s]*)\sin\s(.*)/;
            const parseFileNameAndLine = /(.*):(\d+)$/;

            await this._commands.stack();

            const frames = new Array<StartFrameInfo>();
            // every word of the current line becomes a stack frame.

            await this.defaultDebugProcessStage((line) => {
                // parse output
                const values = parseLine.exec(line);
                if (values) {
                    const index = values[3];
                    //const isActive = values[4];
                    const functionName = values[5];
                    const location = values[6];

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

            this._frames = frames;
        }

        const windowFrames = this._frames.filter(f => f.index >= startFrame && f.index <= endFrame);

        return <StartFrameInfos>{
            frames: windowFrames,
            count: this._frames.length
        };
    }

    public errorStack(startFrame: number, endFrame: number): StartFrameInfos {
        if (!this._lastErrorStack) {
            return <StartFrameInfos>{
                frames: [],
                count: 0
            };
        }

        if (!this._errorFrames) {
            const parseLine = /\s+([^\s]*):\sin\s(.*)/;
            const parseFileNameAndLine = /(.*):(\d+)$/;
            const parseFunctionName = /(method|field)\s+'([^']*)'/;

            const frames = new Array<StartFrameInfo>();

            for (const line of this._lastErrorStack.split('\n')) {
                const values = parseLine.exec(line);
                if (values) {
                    const location = values[1];
                    let functionName = values[2];
                    const functionNameValues = parseFunctionName.exec(functionName);
                    if (functionNameValues) {
                        functionName = functionNameValues[2];
                    }

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
                                name: `${functionName}(${frames.length + 1})`,
                                file: fileName,
                                line: parseInt(locationValues[2])
                            });
                        }
                    }
                }
            }

            this._errorFrames = frames;
        }

        const windowFrames = this._errorFrames.filter(f => f.index >= startFrame && f.index <= endFrame);

        return <StartFrameInfos>{
            frames: windowFrames,
            count: this._errorFrames.length
        };
    }

    public async dumpVariables(variableType: VariableTypes, variableName: string | undefined, variableHandles: Handles<string>, evaluate?: boolean) {
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
            const value = currentObject[rootName];
            if (value.type === "object" && !evaluate) {
                const values = value.value;
                if (values) {
                    for (let name in values) {
                        const value = values[name];
                        variables.push({
                            name: value.name,
                            type: value.type,
                            value: value.type === "object" ? "" : value.value,
                            variablesReference: value.type !== "object" ? 0 : variableHandles.create(
                                variableType === VariableTypes.SingleVariable
                                    ? value.path
                                    : name)
                        });
                    }
                }
            } else {
                variables.push({
                    name: value.name,
                    type: value.type,
                    value: value.type === "object" ? "" : value.value,
                    variablesReference: value.type !== "object" ? 0 : variableHandles.create(
                        variableType === VariableTypes.SingleVariable
                            ? value.path
                            : name)
                });
            }
        }

        variables.sort((a, b): number => {
            if (a.name > b.name) {
                return 1;
            }

            if (a.name < b.name) {
                return -1;
            }

            return 0;
        });

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

    private async processStagesAsync(stages: { text: string | string[], action: (() => Promise<void>) | undefined }[], defaultAction?: Function | undefined) {
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

    private async readAsync(timeout: number = 3000) {
        return new Promise((resolve, reject) => {
            let timerId;
            this._exe.stdout.on('data', (data) => {
                if (timerId) {
                    clearTimeout(timerId);
                }

                resolve(data);
            });

            this._exe.stdout.on('error', (e) => {
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

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
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

        const cwd = process.cwd();
        const rootPath = cleanUpPath(cwd);
        this._sourceFile = cleanUpPath(program);

        this._luaExe = new LuaSpawnedDebugProcess(this._sourceFile, luaExecutable, luaDebuggerFilePath);
        this._luaExe.installDebuggerIfDoesNotExist(cwd);

        this._luaExe.on('error', (msg) => {
            this.sendEvent('stopOnException', msg);
        });

        this._luaExe.on('outputData', (msg) => {
            this.sendEvent('outputData', msg);
        });

        this._luaExe.on('errorData', (msg) => {
            this.sendEvent('errorData', msg);
        });

        this._luaExe.on('end', (msg) => {
            this.sendEvent('end', msg);
        });

        await this._luaExe.spawn();

        for (const [key, bps] of this._breakPoints) {
            if (key.endsWith('.lua')) {
                for (const bp of bps) {
                    const subPath = excludeRootPath(key, rootPath);
                    await this._luaExe.setBreakpoint(subPath, bp.line);
                }
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

    public async startNoDebug(program: string, luaExecutable: string) {
        this._sourceFile = cleanUpPath(program);
        const luaExe = new LuaSpawnedProcess(this._sourceFile, luaExecutable);
        luaExe.on('errorData', (msg) => {
            this.sendEvent('errorData', msg);
        });

        luaExe.on('outputData', (msg) => {
            this.sendEvent('outputData', msg);
        });

        luaExe.on('end', (msg) => {
            this.sendEvent('end', msg);
        });

        await luaExe.spawn();
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
        if (this._luaExe.HasError) {
            return this._luaExe.errorStack(startFrame, endFrame);
        }

        return await this._luaExe.stack(startFrame, endFrame);
    }

    public getError(): string {
        return this._luaExe.HasError ? this._luaExe.LastError || '' : '';
    }

    public getErrorStack(): string {
        return this._luaExe.HasError ? this._luaExe.LastErrorStack || '' : '';
    }

    public async dumpVariables(variableType: VariableTypes, variableName: string | undefined, variableHandles: Handles<string>, evaluate?: boolean) {
        return await this._luaExe.dumpVariables(variableType, variableName, variableHandles, evaluate);
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
        if (this._luaExe.HasError) {
            this.sendEvent('end');
            return;
        }

        let response;
        this._luaExe.dropStackTrace();
        if (response = await this._luaExe.step(type) && !this._luaExe.HasErrorReadingInProgress && !this._luaExe.HasError) {
            this.sendEvent('end');
            return;
        }

        /*
        if (response !== undefined && stepEvent) {
            if (this._luaExe.hasErrorStack()) {
                this.sendEvent("stopOnException", this._luaExe.LastError);
            } else {
                this.sendEvent(stepEvent);
            }
        }
        */

        if (response !== undefined && stepEvent && !this._luaExe.HasErrorReadingInProgress && !this._luaExe.HasError) {
            this.sendEvent(stepEvent);
        }
    }

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }
}