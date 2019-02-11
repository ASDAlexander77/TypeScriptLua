import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { Writable, Readable } from 'stream';
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

    public async runStatement(statement: string) {
        await this.writeLineAsync(statement);
        await this.flush();
    }

    public async pause() {
        await this.writeLineAsync(`pause('start', nil, true)`);
        await this.writeLineAsync(``);
        await this.flush();
    }

    public async ctrlc() {
        await this.writeLineAsync(`\x03`);
        await this.flush();
    }

    public async setBreakpoint(line: number, column?: number, fileName?: string) {
        if (fileName) {
            // TODO: investigate why lua accept only "lowercase" file paths
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
            // TODO: investigate why lua accept only "lowercase" file paths
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

    public async stack(startFrame: number, endFrame: number) {
        if (startFrame || endFrame) {
            await this.writeLineAsync(`trace ${startFrame} ${endFrame}`);
        }
        else {
            await this.writeLineAsync(`trace`);
        }

        await this.flush();
    }

    public async setFrameId(id: number) {
        console.log("#: setFrameId - " + id);

        await this.writeLineAsync("set " + id);
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

class TextStream extends EventEmitter {
    public constructor(stream: Readable) {
        super();

        let restData = '';
        stream.on('data', (binary) => {
            let data = restData + binary.toString();
            restData = '';

            const indexOfCompleteData = data.lastIndexOf('\n');
            if (indexOfCompleteData >= 0) {
                // not complete data;
                restData = data.substr(indexOfCompleteData + 1);
                data = data.substr(0, indexOfCompleteData + 1);

                setImmediate(_ => {
                    this.emit('data', data.split('\n'));
                });
            } else {
                restData = data;
            }
        });
    }
}

type stageType = { text: string | string[], action: (() => Promise<void>) | undefined };

class LuaSpawnedDebugProcess extends EventEmitter {
    private _commands: LuaCommands;
    private _exe: ChildProcess;
    private _lastError: string | null;
    private _lastErrorStack: string | null;
    private _errorOutputInProgress: boolean;
    private _frames: StartFrameInfo[] | null;
    private _totalFrames: number | null;
    private _errorFrames: StartFrameInfo[] | null;

    private stackTrace: string;
    private stackReading: boolean;

    private stages: stageType[] = [];
    private commandNames: string[] = [];
    private defaultActions: (Function | undefined)[] = [];
    private stage: stageType | undefined;
    private defaultAction: Function | undefined;
    // @ts-ignore
    private commandName: string | undefined;

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
        this._totalFrames = null;
        this._frames = null;
    }

    public async spawn() {
        const exe = this._exe = spawn(this.luaExecutable, [
            '-i'
        ]);

        if (!exe.pid) {
            console.log(">>> can't spawn: " + this.luaExecutable);
            this.processErrorOutput(["Can't start process: " + this.luaExecutable]);
            return;
        }

        this._commands = new LuaCommands(exe.stdin);

        exe.on('close', (code) => {
            console.log(`process exited with code ${code}`);
        });

        exe.on('exit', (code) => {
            console.log(`process exited with code ${code}`);
        });

        const errorTextStream = new TextStream(exe.stderr);
        errorTextStream.on('data', (data) => this.processErrorOutput(data));

        const textStream = new TextStream(exe.stdout);
        textStream.on('data', (data) => this.processStdOutput(data));

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

    private pushStages(name: string, stages: stageType[], defaultAction?: Function | undefined) {
        for (const stage of stages) {
            this.stages.push(stage);
            this.defaultActions.push(defaultAction);
            this.commandNames.push(name);
        }

        if (!this.stage) {
            this.stage = this.stages.pop();
            this.defaultAction = this.defaultActions.pop();
            this.commandName = this.commandNames.pop();
        }
    }

    private pushDefaultStages(name: string, action: () => Promise<void>, defaultAction?: Function | undefined) {
        this.pushStages(name,
            [
                {
                    text: ['[DEBUG]>', '>'], action
                }
            ],
            defaultAction);
    }

    private processErrorOutput(data: string[]) {
        this._errorOutputInProgress = true;
        this.sendEvent('errorData', data.join('\n'));

        for (let line of data) {
            if (!this.stackReading) {
                this._lastError = line;
                this._errorFrames = null;
                this.stackReading = true;
            }

            // stack trace
            if (this.stackReading) {
                this.stackTrace += line + '\n';
                if (line.indexOf('[C]: in ?') >= 0) {
                    // end of stack
                    this._errorOutputInProgress = false;
                    this.stackReading = false;
                    this._lastErrorStack = this.stackTrace;
                    this.sendEvent('error', this._lastError);
                }
            }
        }
    }

    private async processStdOutput(data: string[]) {

        if (!this.stage) {
            // this.sendEvent('logData', data.map(l => "<log, no action>: " + l).join('\n'));
            return;
        }

        const isArray = this.stage.text instanceof Array;

        for (let line of data) {
            line = line.trim();
            console.log('>: ' + line);

            if (this.defaultAction) {
                // this.sendEvent('logData', '<log, default action>: [' + this.commandName + "] " + line + "\n");
                this.defaultAction(line);
            }

            const process = isArray ? (<string[]>this.stage.text).some(v => v === line) : line === this.stage.text;
            if (process) {
                console.log('#: match [' + line + '] acting...');
                if (this.stage.action) {
                    // this.sendEvent('logData', '<log, action>: [' + this.commandName + "] " + line + "\n");
                    await this.stage.action();
                }

                this.commandName = this.commandNames.pop();
                this.defaultAction = this.defaultActions.pop();
                this.stage = this.stages.pop();
                if (!this.stage) {
                    console.log('#: no more actions...');
                    break;
                }

                // this.sendEvent('logData', '<log, actions left, defaults left>: [' + this.commandName + "] " + this.stages.length + ' ' + this.defaultActions.length + "\n");
            }
        }
    }

    public async step(type: StepTypes, action: () => Promise<void>) {
        this.pushDefaultStages("step", action, (data) => this.processOutput(data));
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
    }

    public async pause() {
        await this._commands.pause();
        const lastLine = await this.defaultProcessStage((data) => {
            this.processOutput(data);
        });
        return lastLine === ">";
    }

    public async ctrlc() {
        await this._commands.ctrlc();
        const lastLine = await this.defaultProcessStage((data) => {
            this.processOutput(data);
        });
        return lastLine === ">";
    }

    private processOutput(data: any) {
        if (!this._errorOutputInProgress && !this.HasError) {
            const lines = data.toString();
            for (const line of lines.split('\n')) {
                const debugStart = line.startsWith('[DEBUG]>');
                const pause = line.startsWith('[DEBUG]> Paused at') || line.startsWith('Paused at');
                if (!pause) {
                    this.sendEvent('outputData', (debugStart ? line.substr(9) : line) + '\n');
                }
            }
        }
    }

    public async runStatement(statement: string) {
        this._commands.runStatement(statement);
        const lastLine = await this.defaultProcessStage((data) => {
            this.processOutput(data);
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

        if (!this._frames || !this._frames.some(f => f.index >= startFrame && f.index <= endFrame)) {
            const parseLine = /(\[DEBUG\]\>\s)?(\[(\d+)\])?(\*\*\*)?\s+([^\s]*)\sin\s(.*)/;
            const parseFileNameAndLine = /(.*):(\d+)$/;
            const totalRe = /(\[DEBUG\]\>\s)?(\[(\d+)\])?\s+\<TOTAL\>(.*)/;

            await this._commands.stack(startFrame, endFrame);

            const frames = new Array<StartFrameInfo>();
            // every word of the current line becomes a stack frame.

            await this.defaultDebugProcessStage((line) => {
                // parse output
                const values = parseLine.exec(line);
                if (values) {
                    const index = parseInt(values[3]);
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
                                index: index,
                                name: `${functionName}(${index})`,
                                file: fileName,
                                line: parseInt(locationValues[2])
                            });
                        }
                    }
                } else {
                    const totalValues = totalRe.exec(line);
                    if (totalValues) {
                        this._totalFrames = parseInt(totalValues[3]);
                    }
                }
            });

            this._frames = frames;
        }

        const windowFrames = this._frames.filter(f => f.index >= startFrame && f.index <= endFrame);

        return <StartFrameInfos>{
            frames: windowFrames,
            count: this._totalFrames || this._frames.length
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

    public async setFrameId(frameId: number) {
        this.pushDefaultStages("set frame", async () => { }, () => { });
        await this._commands.setFrameId(frameId);
    }

    public async dumpVariables(cb: (variables: any) => void, variableType: VariableTypes, variableName: string | undefined, variableHandles: Handles<string>, evaluate?: boolean) {
        let rootName = variableName;
        switch (variableType) {
            case VariableTypes.Local: rootName = "variables"; break;
            case VariableTypes.Global: rootName = "globals"; break;
            case VariableTypes.Environment: rootName = "environment"; break;
        }

        const variableDeclatation = /(\s*)((([A-Za-z_0-9]+)|\.|\[[^\]]+\])+)\s*=\s*(.*)/;
        const endOfObject = /(\s*)}(;)?.*/;

        const variables = new Array<DebugProtocol.Variable>();

        let objects = new Array<any>();
        let paths = new Array<any>();
        let currentObject: any = {};
        let isStringContinue = false;
        let isBigStringContinue = false;
        let previousStringName = '';

        const processDataLine = (line) => {
            // parse output
            variableDeclatation.lastIndex = 0;
            let values = !isBigStringContinue && variableDeclatation.exec(line);
            if (values && !isBigStringContinue) {
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

                let isString = value.startsWith('\"');
                isStringContinue = value.endsWith('\\');
                if (isString) {
                    value = value.substr(1, value.length - 2);
                }

                isString = value.startsWith('[[');
                if (isString) {
                    isStringContinue = true;
                    isBigStringContinue = true;
                    value = value.substr(2, value.length - 2);
                }

                if (value.endsWith(']]')) {
                    value = value.substr(0, value.length - 2);
                    isStringContinue = false;
                    isBigStringContinue = false;
                }

                if (isStringContinue) {
                    previousStringName = name;
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

                    if (currentObject) {
                        currentObject = currentObject[name].value;
                    }
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

                    if (currentObject) {
                        currentObject[name] = {
                            name,
                            level,
                            path,
                            value,
                            type
                        };
                    }
                }
            } else {

                if (isStringContinue) {
                    const endOfLine = line.endsWith(']];') || line.endsWith('\";');
                    let value;
                    if (endOfLine) {
                        value = line.substr(0, line.length - 1);
                    } else {
                        value = line;
                    }

                    if (value.endsWith('\"')) {
                        value = value.substr(0, value.length - 1);
                        isStringContinue = value.endsWith('\\');
                    }

                    if (value.endsWith(']]')) {
                        value = value.substr(0, value.length - 2);
                        isStringContinue = false;
                        isBigStringContinue = false;
                    }

                    currentObject[previousStringName].value += "\n" + value;
                } else {
                    const end = !isBigStringContinue && endOfObject.exec(line);
                    if (end) {
                        // end of object '};'
                        currentObject = objects.pop();
                        paths.pop();
                    }
                }
            }
        };

        const buildResponse = async () => {
            try {
                if (rootName) {
                    const value = currentObject[rootName];
                    if (value === undefined) {
                        cb(undefined);
                        return;
                    }

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
                    const an = parseInt(a.name);
                    const bn = parseInt(b.name);
                    if (an < bn) {
                        return -1;
                    } else if (an > bn) {
                        return 1;
                    }

                    if (a.name > b.name) {
                        return 1;
                    }

                    if (a.name < b.name) {
                        return -1;
                    }

                    return 0;
                });
            }
            catch (e) {
                cb(e);
                return;
            }

            cb(variables);
        };

        this.pushDefaultStages("dump", buildResponse, processDataLine);

        await this._commands.dumpVariables(variableType, rootName);
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
            throw e;
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

    private async processStagesAsync(stages: stageType[], defaultAction?: Function | undefined) {
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
            const cbData = (data) => {
                if (timerId) {
                    clearTimeout(timerId);
                }

                this._exe.stdout.removeListener('data', cbError);
                resolve(data);
            };
            this._exe.stdout.prependOnceListener('data', cbData);

            const cbError = (e) => {
                if (timerId) {
                    clearTimeout(timerId);
                }

                this._exe.stdout.removeListener('data', cbData);
                reject(e);
            };
            this._exe.stdout.prependOnceListener('error', cbError);

            if (timeout) {
                timerId = setTimeout(() => {
                    this._exe.stdout.removeListener('data', cbData);
                    this._exe.stdout.removeListener('data', cbError);
                    reject('read timeout');
                },
                    timeout);
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

        this._luaExe.on('logData', (msg) => {
            this.sendEvent('logData', msg);
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

        luaExe.on('logData', (msg) => {
            this.sendEvent('logData', msg);
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
	 * Pause
	 */
    public async pause() {
        await this._luaExe.pause();
    }

    public async ctrlc() {
        await this._luaExe.ctrlc();
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

    public async setFrameId(frameId: number) {
        await this._luaExe.setFrameId(frameId);
    }

    public async dumpVariables(cb: (variables: any) => void, variableType: VariableTypes, variableName: string | undefined, variableHandles: Handles<string>, evaluate?: boolean) {
        await this._luaExe.dumpVariables(cb, variableType, variableName, variableHandles, evaluate);
    }

    public async runStatement(statement: string) {
        return await this._luaExe.runStatement(statement);
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

        this._luaExe.dropStackTrace();
        this._luaExe.step(type, async () => {
            if (stepEvent) {
                this.sendEvent(stepEvent);
            }
        });
    }

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }
}
