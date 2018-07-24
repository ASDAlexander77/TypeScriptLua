
export class FunctionContext {
    // if undefined == "_ENV"
    public container: FunctionContext;
    public debug_location: string;
    public linedefined: number;
    public lastlinedefined: number;
    public numparams: number;
    public is_vararg: boolean;
    public maxstacksize: number = 2; // register 0/1 at least
    public code: Array<Array<number>> = [];
    public contants: Array<any> = [];
    public locals: Array<string> = [];
    public upvalues: Array<string> = [];
    public protos: Array<FunctionContext> = [];
    public debug: Array<any> = [];

    public findOrCreateUpvalue(name: string): number {
        // upvalues start with 0
        let index = this.upvalues.findIndex(e => e == name);
        if (index == -1) {
            this.upvalues.push(name);
            return this.upvalues.length - 1;
        }

        return index;
    }

    public findUpvalue(name: string): number {
        // upvalues start with 0
        let index = this.upvalues.findIndex(e => e == name);
        if (index == -1) {
            throw new Error("Item can't be found");
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

    public findOrCreateConst(value: any): number {
        // consts start with 1
        let index = this.contants.findIndex(e => e == value);
        if (index == -1) {
            this.contants.push(value);
            return this.contants.length;
        }

        return index + 1;
    }

    public createProto(value: FunctionContext): number {
        // consts start with 1
        this.protos.push(value);
        return this.protos.length;
    }    
}
