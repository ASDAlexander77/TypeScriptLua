export default class Image {
    private _src: string;
    private _imageData: object;
    private events = {};

    constructor() {
        if (!free_image) {
            // @ts-ignore
            import free_image from 'freeimageadapter';
        }

        if (!free_image) {
            throw new Error('freeimageadapter module is not available');
        }
    }

    public get src(): string {
        return this._src;
    }

    public set src(val: string) {
        this._src = val;

        // @ts-ignore
        this._imageData = free_image.loadImage(this._src);
        if (this._imageData) {
            const onloads = this.events['load'];
            if (onloads) {
                for (const onload of onloads) {
                    onload();
                }
            }
        } else {
            const onerrors = this.events['error'];
            if (onerrors) {
                for (const onerror of onerrors) {
                    onerror();
                }
            }
        }
    }

    public get width(): number {
        return this._imageData ? this._imageData.width : 0;
    }

    public get height(): number {
        return this._imageData ? this._imageData.height : 0;
    }

    public get bits(): any {
        return this._imageData ? this._imageData.bits : null;
    }

    public set onload(cb: any) {
        this.addEventListener('load', cb, false);
    }

    public addEventListener(eventName: string, cb: any, flag: boolean): void {
        let listeners = this.events[eventName];
        if (!listeners) {
            listeners = [];
            this.events[eventName] = listeners;
        }

        listeners.push(cb);
    }

    public removeEventListener(eventName: string, cb: any): void {
        const listeners = this.events[eventName];
        if (listeners) {
            listeners.remove(cb);
        }
    }
}
