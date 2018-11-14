import {
    Logger, logger,
    LoggingDebugSession,
    InitializedEvent, TerminatedEvent, StoppedEvent, BreakpointEvent, OutputEvent,
    Thread, StackFrame, Scope, Source, Handles, Breakpoint
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { basename, join } from 'path';
import { LuaRuntime, LuaBreakpoint, VariableTypes, StartFrameInfo } from './luaRuntime';
import { Subject } from 'await-notify';
import * as sm from 'source-map';
import * as fs from 'fs-extra';

/**
 * This interface describes the lua debug specific launch attributes
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attributes lives in the package.json of the lua-debug extension.
 * The interface should always match this schema.
 */
interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** Absolute path to the working directory of the program being debugged. */
    cwd: string;
    /** An absolute path to the "program" to debug. */
    program: string;
    /** Automatically stop target after launch. If not specified, target does not stop. */
    stopOnEntry?: boolean;
    /** enable logging the Debug Adapter Protocol */
    trace?: boolean;
    /** An absolute path to the lua "executable" to launch. */
    luaExecutable: string;
    /** An absolute path to the lua debugger (set in config) */
    luaDebuggerFilePath: string,
}

export class LuaDebugSession extends LoggingDebugSession {

    // we don't support multiple threads, so we can use a hardcoded ID for the default thread
    private static THREAD_ID = 1;

    // a Mock runtime (or debugger)
    private _runtime: LuaRuntime;

    private _variableHandles = new Handles<string>();

    private _configurationDone = new Subject();

    private _dumpInProgress: Subject;

    private _sourceMapCache = new Map<string, sm.BasicSourceMapConsumer>();

    private _sourceMapFilePathCache = new Map<string, string>();

    private _mapFiles: true | Map<string, any | boolean>;

	/**
	 * Creates a new debug adapter that is used for one debug session.
	 * We configure the default implementation of a debug adapter here.
	 */
    public constructor() {
        super("lua-debug.txt");

        // this debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(false);

        this._runtime = new LuaRuntime();

        // setup event handlers
        this._runtime.on('stopOnEntry', () => {
            this.sendEvent(new StoppedEvent('entry', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnStep', () => {
            this.sendEvent(new StoppedEvent('step', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnBreakpoint', () => {
            this.sendEvent(new StoppedEvent('breakpoint', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnException', () => {
            this.sendEvent(new StoppedEvent('exception', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('breakpointValidated', (bp: LuaBreakpoint) => {
            this.sendEvent(new BreakpointEvent('changed', <DebugProtocol.Breakpoint>{ verified: bp.verified, id: bp.id }));
        });
        this._runtime.on('output', (text, filePath, line, column) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            e.body.column = this.convertDebuggerColumnToClient(column);
            this.sendEvent(e);
        });
        this._runtime.on('end', () => {
            this.sendEvent(new TerminatedEvent());
        });
    }

	/**
	 * The 'initialize' request is the first request called by the frontend
	 * to interrogate the features the debug adapter provides.
	 */
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {

        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};

        // the adapter implements the configurationDoneRequest.
        response.body.supportsConfigurationDoneRequest = true;

        // make VS Code to use 'evaluate' when hovering over source
        response.body.supportsEvaluateForHovers = true;

        // make VS Code to show a 'step back' button
        response.body.supportsStepBack = true;

        this.sendResponse(response);

        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        this.sendEvent(new InitializedEvent());
    }

	/**
	 * Called at the end of the configuration sequence.
	 * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
	 */
    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);

        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments) {

        // make sure to 'Stop' the buffered logging if 'trace' is not set
        logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false);

        // set current folder
        if (args.cwd) {
            process.chdir(args.cwd);
        }

        if (this._mapFiles === undefined) {
            await this.readAllMapFile(process.cwd());
        }

        // load map file to setbreakpoints
        const sourceMapConsumer = await this.loadMapFileIfExists(args.program);
        if (sourceMapConsumer) {
            const programPathClean = this._runtime.cleanUpFile(args.program);

            const breakpointsMap = this._runtime.breakPoints;
            for (const source in sourceMapConsumer.sources) {
                const sourcePath = join(sourceMapConsumer.sourceRoot, source);
                const bps = breakpointsMap.get(sourcePath);
                if (bps) {
                    const mappedLines = this.convertLinesFromSourceMapConsumer(bps.map(bp => bp.line), sourceMapConsumer, source);
                    for (const mappedLine of mappedLines) {
                        this._runtime.setBreakPoint(programPathClean, mappedLine);
                    }
                }
            }
        }

        // start the program in the runtime
        await this._runtime.start(args.program, !!args.stopOnEntry, args.luaExecutable, args.luaDebuggerFilePath);

        // wait until configuration has finished (and configurationDoneRequest has been called)
        await this._configurationDone.wait(1000);

        this.sendResponse(response);
    }

    protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments) {
        const path = this.convertPathFromMap(<string>args.source.path, args.source.origin);
        const clientLines = args.lines || [];
        const originLines = this.convertLinesFromMap(clientLines, args.source.origin, args.source.name);

        // clear all breakpoints for this file
        this._runtime.clearBreakpoints(path);

        // set and verify breakpoint locations
        const actualBreakpoints = new Array<DebugProtocol.Breakpoint>();
        for (let index = 0; index < originLines.length; index++) {
            const element = originLines[index];
            const fileLine = clientLines[index];
            let { verified, line, id } = await this._runtime.setBreakPoint(path, this.convertClientLineToDebugger(element));
            const bp = <DebugProtocol.Breakpoint>new Breakpoint(verified, this.convertDebuggerLineToClient(fileLine));
            bp.id = id;
            actualBreakpoints.push(bp);
        }

        // send back the actual breakpoint positions
        response.body = {
            breakpoints: actualBreakpoints
        };
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {

        // runtime supports now threads so just return a default thread.
        response.body = {
            threads: [
                new Thread(LuaDebugSession.THREAD_ID, "thread 1")
            ]
        };
        this.sendResponse(response);
    }

    protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments) {

        const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
        const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
        const endFrame = startFrame + maxLevels;

        const stk = await this.getStackTrace(startFrame, endFrame);

        response.body = {
            stackFrames: stk.frames
                .map(f => this.convertFrameFromMap(f))
                .map(f => new StackFrame(f.index, f.name, this.createSource(f.file, f.origin), this.convertDebuggerLineToClient(f.line))),
            totalFrames: stk.count
        };
        this.sendResponse(response);
    }

    protected async getStackTrace(startFrame, endFrame) {
        const stk = await this._runtime.stack(startFrame, endFrame);

        // creating cache of map files
        for (const frame of stk.frames) {
            await this.loadMapFileIfExists(frame.file);
        }

        return stk;
    }

    private async loadMapFileIfExists(execFile: string): Promise<sm.BasicSourceMapConsumer | undefined> {
        if (execFile && execFile in this._sourceMapCache) {
            return undefined;
        }

        const mapFile = execFile.endsWith('.map') ? execFile : execFile + ".map";
        const filePath = this.getFilePathOfMapFile(mapFile);
        if (filePath) {
            const json = await fs.readJson(filePath);
            this._sourceMapFilePathCache[execFile] = filePath;
            return this._sourceMapCache[execFile] = await new sm.SourceMapConsumer(json);
        } else {
            console.error(`Could not load file ${mapFile}, current folder: ${process.cwd()}`);
        }
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {

        const frameReference = args.frameId;
        const scopes = new Array<Scope>();

        scopes.push(new Scope("Locals", this._variableHandles.create("::local:" + frameReference), false));
        scopes.push(new Scope("Globals", this._variableHandles.create("::global:" + frameReference), true));
        scopes.push(new Scope("Environment", this._variableHandles.create("::environment:" + frameReference), true));

        response.body = {
            scopes: scopes
        };
        this.sendResponse(response);
    }

    protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments) {

        if (this._dumpInProgress) {
            await this._dumpInProgress.wait(3000);
            this._dumpInProgress = null;
        }

        const dumpInProgress = this._dumpInProgress = new Subject();

        const id = this._variableHandles.get(args.variablesReference);

        let variableName;
        let variableType = VariableTypes.Local;
        if (id.startsWith("::local")) {
            variableType = VariableTypes.Local;
        } else if (id.startsWith("::global")) {
            variableType = VariableTypes.Global;
        } else if (id.startsWith("::environment")) {
            variableType = VariableTypes.Environment;
        } else {
            variableType = VariableTypes.SingleVariable;
            variableName = id;
        }

        const variables = await this._runtime.dumpVariables(variableType, variableName, this._variableHandles);

        response.body = {
            variables: variables
        };

        dumpInProgress.notify();
        this._dumpInProgress = null;

        this.sendResponse(response);
    }

    protected async continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments) {
        await this._runtime.continue();
        this.sendResponse(response);
    }

    protected async nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments) {
        await this._runtime.stepOver();
        this.sendResponse(response);
    }

    protected async stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments) {
        await this._runtime.stepIn();
        this.sendResponse(response);
    }

    protected async stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments) {
        await this._runtime.stepOut();
        this.sendResponse(response);
    }

    protected async evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments) {

        let reply: string | undefined = undefined;

        /*
        if (args.context === 'repl') {
            // 'evaluate' supports to create and delete breakpoints from the 'repl':
            const matches = /new +([0-9]+)/.exec(args.expression);
            if (matches && matches.length === 2) {
                const mbp = await this._runtime.setBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                const bp = <DebugProtocol.Breakpoint>new Breakpoint(mbp.verified, this.convertDebuggerLineToClient(mbp.line), undefined, this.createSource(this._runtime.sourceFile));
                bp.id = mbp.id;
                this.sendEvent(new BreakpointEvent('new', bp));
                reply = `breakpoint created`;
            } else {
                const matches = /del +([0-9]+)/.exec(args.expression);
                if (matches && matches.length === 2) {
                    const mbp = await this._runtime.clearBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                    if (mbp) {
                        const bp = <DebugProtocol.Breakpoint>new Breakpoint(false);
                        bp.id = mbp.id;
                        this.sendEvent(new BreakpointEvent('removed', bp));
                        reply = `breakpoint deleted`;
                    }
                }
            }
        }
        */

        response.body = {
            result: reply ? reply : `evaluate(context: '${args.context}', '${args.expression}')`,
            variablesReference: 0
        };

        this.sendResponse(response);
    }

    //---- helpers
    private async readAllMapFile(cwd: string) {
        const files = await this.readAllMapFileInDirectory(cwd);
        if (files !== false) {
            this._mapFiles = files;
        }
    }

    private async readAllMapFileInDirectory(filePath: string) {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            const allFiles = await fs.readdir(filePath);
            const files = new Map<string, any | boolean>();
            for (const file of allFiles) {
                const value = await this.readAllMapFileInDirectory(join(filePath, file));
                if (value !== false) {
                    files[file] = value;
                }
            }

            return files;
        }

        if (stat.isFile()) {
            return filePath.endsWith('.map');
        }

        return false;
    }

    private getFilePathOfMapFile(fileMapName: string): string | undefined {
        if (!this._mapFiles) {
            return undefined;
        }

        return this.getFilePathOfMapFileInternal(fileMapName, <Map<string, any>>this._mapFiles, '');
    }

    private getFilePathOfMapFileInternal(fileMapName: string, mapFiles: Map<string, any>, path: string): string | undefined {
        if (!this._mapFiles) {
            return undefined;
        }

        for (const item in mapFiles) {
            if (item === fileMapName) {
                return join(path, item);
            }

            const value = mapFiles[item];
            if (value !== true) {
                const subPath = this.getFilePathOfMapFileInternal(fileMapName, <Map<string, any>>value, item);
                if (subPath && subPath.endsWith('.map')) {
                    return join(path, subPath);
                }
            }
        }
    }

    private createSource(filePath: string, origin?: string): Source {
        // default response
        return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, origin, 'lua-file-adapter-data');
    }

    private convertFrameFromMap(frame: StartFrameInfo) {
        const originalPosition = this.getOriginalPositionFor(frame.file, frame.line || 1, frame.column || 0);
        if (originalPosition) {
            frame.origin = frame.file;
            frame.file = originalPosition.source;

            if (frame.line > 0) {
                frame.line = originalPosition.line;
                frame.column = originalPosition.column;
            } else {
                frame.line = 1;
                frame.column = 0;
            }
        }

        return frame;
    }

    private convertPathFromMap(path: string, origin?: string) {
        if (!origin) {
            return path;
        }

        const consumer = this._sourceMapCache[origin];
        if (!consumer) {
            return path;
        }

        return this.replaceFileName(this._sourceMapFilePathCache[consumer.file], consumer.file);
    }

    private replaceFileName(path: string, newFileName: string) {
        let subPathIndex = path.lastIndexOf('\\');
        if (subPathIndex === -1) {
            subPathIndex = path.lastIndexOf('/');
        }

        if (subPathIndex === -1) {
            return newFileName;
        }

        return path.substr(0, subPathIndex + 1) + newFileName;
    }

    private convertLinesFromMap(lines: number[], origin?: string, sourceFile?: string): number[] {
        if (!origin) {
            return lines;
        }

        const consumer = this._sourceMapCache[origin];
        if (!consumer) {
            return lines;
        }

        return this.convertLinesFromSourceMapConsumer(lines, consumer, sourceFile || '');
    }

    private convertLinesFromSourceMapConsumer(lines: number[], consumer: sm.BasicSourceMapConsumer, sourceFile: string) {
        const originLines = new Array<number>();
        for (const line of lines) {
            const originPosition = consumer.generatedPositionFor({
                source: sourceFile || '',
                line: line,
                column: 0
            });

            if (originPosition && originPosition.line) {
                originLines.push(originPosition.line);
            } else {
                originLines.push(line);
            }
        }

        return originLines;
    }

    private getOriginalPositionFor(filePath: string, line: number, column: number): any {
        // check if filename is map file
        const consumer = this._sourceMapCache[filePath];
        if (!consumer) {
            return undefined;
        }

        // TODO: do not forget to call destroy
        ////consumer.destroy();
        return consumer.originalPositionFor({ line, column });
    }
}
