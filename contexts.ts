
export class FunctionContext {
    public debug_location: string;
    public linedefined: number;
    public lastlinedefined: number;
    public numparams: number;
    public is_vararg: boolean;
    public maxstacksize: number;
    public code: Array<Array<number>> = [];
    public contants: Array<string> = [];
    public locals: Array<string> = [];
    public upvalues: Array<string> = [];

    public findOrCreateUpvalue(name: string): number {
        // upvalues start with 0
        let index = this.upvalues.findIndex(e => e == name);
        if (index == -1) {
            this.upvalues.push(name);
            return this.upvalues.length - 1;
        }

        return index;
    }

    public findOrCreateLocal(name: string): number {
        // locals start with 0
        let index = this.locals.findIndex(e => e == name);
        if (index == -1) {
            this.locals.push(name);
            return this.locals.length - 1;
        }

        return index;
    }

    public findOrCreateConst(name: string): number {
        // consts start with 1
        let index = this.contants.findIndex(e => e == name);
        if (index == -1) {
            this.contants.push(name);
            return this.contants.length;
        }

        return index + 1;
    }
}
