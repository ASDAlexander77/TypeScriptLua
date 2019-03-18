declare class ImageObject {
    public src: string;

    public width: number;

    public height: number;

    public bits: any;

    public onload: any;

    public addEventListener(eventName: string, cb: any, flag: boolean): void;

    public removeEventListener(eventName: string, cb: any): void;
}
