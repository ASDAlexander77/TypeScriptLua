import * as ts from 'typescript';
import { ResolvedInfo, ResolvedKind, StackResolver } from './resolvers';

export class FunctionContext {
    // if undefined == "_ENV"
    public container: FunctionContext;
    // to track current register(stack)
    public current_register = 0;
    // stack resolver
    public stack: StackResolver = new StackResolver();

    // function information
    public debug_location: string;
    public linedefined: number;
    public lastlinedefined: number;
    public numparams: number;
    public is_vararg: boolean;
    public maxstacksize = 2; // register 0/1 at least
    public code: Array<Array<number>> = [];
    public contants: Array<any> = [];
    public locals: Array<string> = [];
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

    public findOrCreateLocal(name: string): number {
        // locals start with 0
        const index = this.locals.findIndex(e => e === name);
        if (index === -1) {
            this.locals.push(name);
            return this.locals.length - 1;
        }

        return index;
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
        return this.protos.length;
    }

    public useRegister(): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo();
        resolvedInfo.kind = ResolvedKind.Register;
        const ret = resolvedInfo.value = this.current_register++;
        if (ret > this.maxstacksize) {
            this.maxstacksize = ret;
        }

        return resolvedInfo;
    }

    public popRegister(resolvedInfo: ResolvedInfo): void {
        if (resolvedInfo.kind === ResolvedKind.Register) {
            this.current_register = resolvedInfo.value;
        }
    }

    public getRegisterOrConst(node: ts.Node): number {
        if (!(<any>node).resolved_value) {
            throw new Error('Resolved info can\'t be found');
        }

        const resolvedInfo: ResolvedInfo = <ResolvedInfo>(<any>node).resolved_value;
        if (resolvedInfo.kind === ResolvedKind.Const || resolvedInfo.kind === ResolvedKind.Register) {
            return resolvedInfo.value;
        }

        throw new Error('Resolved info can\'t be found');
    }

    public getUpvalue(node: ts.Node): number {
        if (!(<any>node).resolved_value) {
            throw new Error('Resolved info can\'t be found');
        }

        if ((<any>node).resolved_owner) {
            const resolved_owner = <ResolvedInfo>(<any>node).resolved_owner;
            if (resolved_owner.kind === ResolvedKind.Upvalue) {
                return resolved_owner.value;
            }
        }

        throw new Error('Resolved info can\'t be found');
    }

    public isUpvalue(node: ts.Node): boolean {
        if (!(<any>node).resolved_value) {
            throw new Error('Resolved info can\'t be found');
        }

        if ((<any>node).resolved_owner) {
            const resolved_owner = <ResolvedInfo>(<any>node).resolved_owner;
            return resolved_owner.kind === ResolvedKind.Upvalue;
        }

        return false;
    }
}
