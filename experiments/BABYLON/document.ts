export default class DocumentEx {
    static events = {};

    constructor() {
    }

    // @ts-ignore
    public static addEventListener(eventName: string, cb: any, flag: boolean): void {
        let listeners = this.events[eventName];
        if (!listeners) {
            listeners = [];
            this.events[eventName] = listeners;
        }

        listeners.push(cb);
    }
}
