
class WindowEx {
    innerWidth = 640;
    innerHeight = 480;

    static addEventListener(eventName: string, cb: any, flag: boolean): void {
    }

    static setTimeout(funct: any, millisec: number) {
        if (funct) {
            funct();
        }
    }
}
