// Globals TypeScript requires structurally which the jslib runtime does not implement.
// Everything below the prelude marker in JSLib.d.ts is generated from experiments/jslib.
// Lua natives (math, table, tostring, os, io, debug) deliberately stay out: they are
// handled at emission time by 'unresolvedFilter' in src/resolvers.ts, and user code
// declares whichever ones it needs.

interface Boolean { }

interface Function {
    apply(thisArg: any, argArray?: any): any;
    call(thisArg: any, ...argArray: any[]): any;
    bind(thisArg: any, ...argArray: any[]): any;
    readonly length: number;
    prototype: any;
}

interface CallableFunction extends Function { }

interface NewableFunction extends Function { }

interface IArguments {
    [index: number]: any;
    length: number;
}

interface Symbol {
    toString(): string;
}

interface IteratorResult<T> {
    done: boolean;
    value: T;
}

interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
}

interface Iterable<T> { }

interface IterableIterator<T> extends Iterator<T> { }

interface ReadonlyArray<T> {
    readonly length: number;
    readonly [n: number]: T;
}

interface TemplateStringsArray extends ReadonlyArray<string> { }

interface RegExpMatchArray extends Array<string> {
    index?: number;
    input?: string;
}

interface RegExpExecArray extends Array<string> {
    index: number;
    input: string;
}

declare var NaN: number;
declare var Infinity: number;
