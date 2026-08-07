// GENERATED FILE - do not edit by hand.
// Produced from experiments/jslib by 'npm run build-jslib-dts'.

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

declare function decodeURIComponent(s: string): string;

declare function toPrimitiveForParse(v: any): any;

declare function parseInt(v: any): number;

declare function parseFloat(v: any): number;

declare function isNaN(v: any): boolean;

declare function isFinite(v: any): boolean;

declare class Object {
    constructor(obj?: object);
    static create(proto: any): any;
    static freeze(obj: any): void;
    static keys(obj: any): string[];
    static defineProperty(obj: any, name: string, opts: any): void;
    static getOwnPropertyDescriptor(obj: any, name: string): {};
    static getPrototypeOf(obj: any): any;
}

declare class Map<T> {
    [k: string]: T;
}

declare type FuncString = (p: string) => string;

declare class StringHelper {
    static getLength(this: string): number;
    static toConcatString(val: any): string;
    static fromCharCode(code: string | number): string;
    static charCodeAt(this: string, index: number): number;
    static replace(this: string, valOrRegExp: string | RegExp, valOrFunc: string | FuncString): string;
    static substr(this: string, begin?: number, len?: number): string;
    static substring(this: string, begin?: number, _end?: number): string;
    static slice(this: string, start?: number, _end?: number): string;
    static indexOf(this: string, pattern: string, begin?: number): number;
    static lastIndexOf(this: string, pattern: string, begin?: number): number;
    static search(this: string, pattern: string | RegExp, begin?: number): number;
    static toLowerCase(this: string): string;
    static toUpperCase(this: string): string;
    static split(this: string, separator: string): Array<string>;
}

declare class String {
    getLength(): number;
    static toConcatString(val: any): string;
    static fromCharCode(code: string | number): string;
    charCodeAt(index: number): number;
    replace(valOrRegExp: string | RegExp, valOrFunc: string | FuncString): string;
    substr(begin?: number, len?: number): string;
    substring(begin?: number, _end?: number): string;
    slice(start?: number, _end?: number): string;
    indexOf(pattern: string, begin?: number): number;
    lastIndexOf(pattern: string, begin?: number): number;
    search(pattern: string | RegExp, begin?: number): number;
    toLowerCase(): string;
    toUpperCase(): string;
    split(separator: string): Array<string>;
    constructor(constString: string);
    readonly length: number;
    toString(): String;
}

declare class Error {
    constructor(message: string);
    toString(): String;
}

declare class ArrayHelper {
    static getLength(_this: any[] | Array<any>): number;
    static pushOne<T>(_this: any[] | Array<T>, obj: T): void;
}

declare class ArrayNullElement {
    static __isNull: boolean;
}

declare class ArrayUndefinedElement {
    static __isUndefined: boolean;
}

declare class Array<T> {
    [k: number]: T;
    constructor(size?: number);
    push(...objs: T[]): void;
    pop(): any;
    length: number;
    indexOf(val: T): number;
    join(separator?: string): string;
    toString(): string;
    sort(): void;
    shift(): T;
    unshift(...objs: T[]): void;
    concat(other: T[]): T[];
    remove(obj: T): void;
    map(func: (currentValue: T, index: number, arr: T[]) => T, thisValue?: any): T[];
    filter(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): T[];
    forEach(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): void;
    every(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): void;
    splice(index: number, howmany?: number, ...items: T[]): T[];
    slice(begin?: number, _end?: number): T[];
}

declare class TypedArrayBase {
    size: number;
    byteLength: number;
    data: number[];
    buffer: ArrayBuffer;
    constructor(sizeOrData: number | number[], sizePerElement: number, type: string);
}

declare class ArrayBuffer {
    bufferNativeInstance: any;
    constructor(sizeBytes: number);
}

declare class Float32Array extends TypedArrayBase {
    static TYPE: string;
    static BYTES_PER_ELEMENT: number;
    constructor(sizeOrData: number | Array<number>);
}

declare class Float64Array extends TypedArrayBase {
    static TYPE: string;
    static BYTES_PER_ELEMENT: number;
    constructor(sizeOrData: number | Array<number>);
}

declare class Uint8Array extends TypedArrayBase {
    static TYPE: string;
    static BYTES_PER_ELEMENT: number;
    constructor(sizeOrData: number | Array<number>);
}

declare class Uint16Array extends TypedArrayBase {
    static TYPE: string;
    static BYTES_PER_ELEMENT: number;
    constructor(sizeOrData: number | Array<number>);
}

declare class Uint32Array extends TypedArrayBase {
    static TYPE: string;
    static BYTES_PER_ELEMENT: number;
    constructor(sizeOrData: number | Array<number>);
}

declare class Uint64Array extends TypedArrayBase {
    static TYPE: string;
    static BYTES_PER_ELEMENT: number;
    constructor(sizeOrData: number | Array<number>);
}

declare class NumberHelper {
    static toString(this: number, ...params: any[]): string;
}

declare class Number {
    toString(...params: any[]): string;
    static MAX_VALUE: number;
    static MIN_VALUE: number;
    constructor(constNumber: number);
}

declare class Math {
    static E: number;
    static LN10: number;
    static LN2: number;
    static LOG2E: number;
    static LOG10E: number;
    static PI: number;
    static SQRT1_2: number;
    static SQRT2: number;
    static pow(op: number, op2: number): number;
    static min(op: number, op2: number): number;
    static max(op: number, op2: number): number;
    static sin(op: number): number;
    static cos(op: number): number;
    static asin(op: number): number;
    static acos(op: number): number;
    static abs(op: number): number;
    static floor(op: number): number;
    static round(op: number): number;
    static sqrt(op: number): number;
    static tan(op: number): number;
    static atan(op: number): number;
    static atan2(op: number): number;
    static log(op: number): number;
    static exp(op: number): number;
    static random(): number;
}

declare class Date {
    static initial_clock: number;
    static initial_time: number;
    getHours(): number;
    getMinutes(): number;
    getSeconds(): number;
    now(): number;
}

declare class RegExp {
    constructor(pattern: string, flags?: string);
    test(t: string): any;
    exec(t: string): RegExpExecArray | null;
    getPattern(): string;
    __getLuaPattern(): string;
}

declare type TokenSingle = string | number | boolean | null | {};

declare type Token = TokenSingle | Array<TokenSingle>;

declare class SyntaxError extends Error {
    constructor();
}

declare class JSONParse {
    abort(): void;
    lex(): Token;
    get(value: Token): Token;
    parse(source: string): Token;
}

declare class JSON {
    static parse(source: string): any;
}

declare class XMLHttpRequest {
    static readonly UNSENT: number;
    static readonly OPENED: number;
    static readonly HEADERS_RECEIVED: number;
    static readonly LOADING: number;
    static readonly DONE: number;
    readyState: number;
    responseType: string;
    status: number;
    statusText: string;
    responseText: string;
    open(method: string, url: string, asyncType: boolean): void;
    addEventListener(eventName: string, cb: any, flag?: boolean): void;
    removeEventListener(eventName: string, cb: any, flag?: boolean): void;
    send(body?: string): void;
}

declare class Console {
    static log(...params: any[]): void;
    static warn(...params: any[]): void;
    static error(...params: any[]): void;
}

declare var console: typeof Console;
