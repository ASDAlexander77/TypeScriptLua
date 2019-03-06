export default class Image {

    private events = {};

    constructor() {
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
