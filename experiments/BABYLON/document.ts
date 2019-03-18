// @ts-ignore
import Canvas2d from './canvas2d';

export default class DocumentEx {
    static events = {};

    constructor() {
    }

    public static createElement(name: string): any {
        return { tag: name, getContext: DocumentEx.getContext };
    }

    public static getContext(contextName: string): any {
        if (contextName === '2d') {
            return new Canvas2d();
        }

        throw new Error('Context ' + contextName + ' is not supported.');
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

    public static removeEventListener(eventName: string, cb: any): void {
        const listeners = this.events[eventName];
        if (listeners) {
            listeners.remove(cb);
        }
    }
}
