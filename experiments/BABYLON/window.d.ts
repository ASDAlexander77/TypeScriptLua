declare class WindowEx {
    public static innerWidth;
    public static innerHeight;

    public static focus();

    public static addEventListener(eventName: string, cb: any, flag: boolean): void;

    public static removeEventListener(eventName: string, cb: any): void;

    public static setTimeout(funct: any, millisec: number);

    public static setImmediate(funct: any);

    public static setInterval(funct: any, millisec: number);

    public static loop();
}
