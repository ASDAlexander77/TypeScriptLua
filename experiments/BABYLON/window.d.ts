declare class WindowEx {
    public innerWidth;
    public innerHeight;

    public focus();

    public addEventListener(eventName: string, cb: any, flag: boolean): void;

    public setTimeout(funct: any, millisec: number);

    public setImmediate(funct: any);

    public loop();
}
