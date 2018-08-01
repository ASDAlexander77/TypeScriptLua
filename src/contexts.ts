import * as ts from 'typescript';
import { ResolvedInfo, ResolvedKind, StackResolver } from './resolvers';

class LocalInfo {
    public name: string;
    public register: number;
}

export class FunctionContext {
    public location_node: ts.Node;
    // if undefined == "_ENV"
    public container: FunctionContext;
    // to track current register(stack)
    public availableRegister = 0;
    // stack resolver
    public stack: StackResolver = new StackResolver(this);

    // function information
    public debug_location: string;
    public linedefined: number;
    public lastlinedefined: number;
    public numparams: number;
    public is_vararg: boolean;
    public maxstacksize = 2; // register 0/1 at least
    public code: Array<Array<number>> = [];
    public contants: Array<any> = [];
    public locals: Array<LocalInfo> = [];
    public upvalues: Array<string> = [];
    public protos: Array<FunctionContext> = [];
    public debug: Array<any> = [];

    public findOrCreateUpvalue(name: string): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e === name);
        if (index === -1) {
            this.upvalues.push(name);
            return this.upvalues.length - 1;
        }

        return index;
    }

    public findUpvalue(name: string): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e === name);
        if (index === -1) {
            throw new Error('Item can\'t be found');
        }

        return index;
    }

    public createLocal(name: string, register?: number): number {
        // locals start with 0
        const index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {
            this.locals.push(<LocalInfo>{ name: name, register: register });
            return register;
        }

        throw new Error('Local already created.');
    }

    public findLocal(name: string): number {
        // locals start with 0
        const index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {
            throw new Error('Can\'t find local: ' + name);
        }

        return this.locals[index].register;
    }

    public findOrCreateConst(value: any): number {
        // consts start with 1
        const index = this.contants.findIndex(e => e === value);
        if (index === -1) {
            this.contants.push(value);
            return this.contants.length;
        }

        return index + 1;
    }

    public createProto(value: FunctionContext): number {
        // consts start with 1
        this.protos.push(value);
        return this.protos.length - 1;
    }

    public useRegister(): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(this);
        resolvedInfo.kind = ResolvedKind.Register;
        const ret = resolvedInfo.register = this.availableRegister++;
        if (ret > this.maxstacksize) {
            this.maxstacksize = ret;
        }

        return resolvedInfo;
    }

    public useEmptyRegister(): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(this);
        resolvedInfo.kind = ResolvedKind.Register;
        return resolvedInfo;
    }

    public useRegisterAndPush(): ResolvedInfo {
        const resolvedInfo = this.useRegister();
        this.stack.push(resolvedInfo);
        return resolvedInfo;
    }

    public useEmptyRegisterAndPush(): ResolvedInfo {
        const resolvedInfo = this.useEmptyRegister();
        this.stack.push(resolvedInfo);
        return resolvedInfo;
    }

    public popRegister(resolvedInfo: ResolvedInfo): void {
        if (resolvedInfo.kind === ResolvedKind.Register && resolvedInfo.register !== undefined && !resolvedInfo.local) {
            if ((this.availableRegister - resolvedInfo.getRegister()) > 1) {
                throw new Error('available register and restored register are to far (> 1)');
            }

            this.availableRegister = resolvedInfo.getRegister();
        }
    }
}
