// the public surface of window.ts. every member is static there, and the emitter turns a static
// into a plain field of the class table - so this file has to keep declaring them static for call
// sites to be emitted as 'window.setTimeout(...)' rather than 'window:setTimeout(...)'
declare class WindowEx {
    public static innerWidth;
    public static innerHeight;

    public static location: { href: string };

    public static focus();

    public static postMessage(message: any, targetOrigin: any, transfer?: any);

    public static addEventListener(eventName: string, cb: any, flag: boolean): void;

    public static removeEventListener(eventName: string, cb: any): void;

    public static setTimeout(funct: any, millisec: number);

    public static setImmediate(funct: any);

    public static setInterval(funct: any, millisec: number);

    public static loop();
}

// babyloncli.ts assigns 'new WindowEx()' here, but the lua runtime reaches a class' statics through
// the instance's '__proto', so what is actually readable off 'window' is the static side
declare var window: typeof WindowEx;
