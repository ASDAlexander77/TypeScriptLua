import * as ts from 'typescript';
import { ResolvedInfo, ResolvedKind, StackResolver } from './resolvers';

class LocalVarInfo {
    public name: string;
    public register: number;
    public debugStartCode: number;
    public debugEndCode: number;
}

export class UpvalueInfo {
    public name: string;
    public instack: boolean;
    public index: number;
}

export class CodeStorage {
    private code: number[][] = [];

    public constructor(private functionContext: FunctionContext) {
    }

    public push(opCode: number[]) {
        this.code.push(opCode);
    }

    public pop(): number[] {
        return this.code.pop();
    }

    public get length(): number {
        return this.code.length;
    }

    public get latest(): number[] {
        return this.code[this.code.length - 1];
    }

    public forEach(action: (element) => void) {
        this.code.forEach(action);
    }

    public codeAt(index: number): number[] {
        return this.code[index];
    }

    public setCodeAt(index: number, opCode: number[]) {
        this.code[index] = opCode;
    }
}

export class FunctionContext {
    public function_or_file_location_node: ts.Node;
    public current_location_node: ts.Node;
    // if undefined == "_ENV"
    public container: FunctionContext;
    // to track current register(stack)
    public availableRegister = 0;
    // stack resolver
    public stack = new StackResolver(this);
    // code stack
    public code = new CodeStorage(this);

    // function information
    public debug_location: string;
    public linedefined: number;
    public lastlinedefined: number;
    public numparams: number;
    public is_vararg: boolean;
    public maxstacksize = 1; // register 0/1 at least
    public constants: Array<any> = [];
    public locals: Array<LocalVarInfo> = [];
    public upvalues: Array<UpvalueInfo> = [];
    public protos: Array<FunctionContext> = [];
    public debug: Array<any> = [];
    public local_scopes: Array<any> = [];
    public location_scopes: Array<any> = [];
    // to support break, continue in loops
    public breaks: Array<number> = [];
    public continues: Array<number> = [];

    public newLocalScope(node: ts.Node) {
        this.location_scopes.push(this.current_location_node);
        this.current_location_node = node;

        this.local_scopes.push(this.locals);
        this.locals = [];
    }

    public restoreLocalScope() {
        this.debugInfoMarkEndOfScopeForLocals();

        this.locals = this.local_scopes.pop();
        this.current_location_node = this.location_scopes.pop();
    }

    public debugInfoMarkEndOfScopeForLocals() {
        this.locals.forEach(l => {
            if (!l.debugEndCode) {
                l.debugEndCode = this.code.length;
            }
        });
    }

    public findOrCreateUpvalue(name: string, instack: boolean, indexInStack?: number): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e.name === name);
        if (index === -1) {
            this.upvalues.push({name, instack: instack, index: indexInStack});
            return this.upvalues.length - 1;
        }

        return index;
    }

    public createUpvalue(name: string, instack: boolean): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e.name === name);
        if (index === -1) {
            this.upvalues.push({name, instack: false || instack, index: undefined});
            return this.upvalues.length - 1;
        }

        throw new Error('Upvalue:' + name + 'exists');
    }

    public findUpvalue(name: string, noerror?: boolean): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e.name === name);
        if (index === -1 && !noerror) {
            throw new Error('Item can\'t be found');
        }

        return index;
    }

    public createLocal(name: string): ResolvedInfo {
        // locals start with 0
        const index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {
            const registerInfo = this.useRegister();
            this.locals.push(<LocalVarInfo>{ name: name, register: registerInfo.getRegister(), debugStartCode: this.code.length });
            return registerInfo;
        }

        throw new Error('Local already created.');
    }

    public findScopedLocal(name: string, noerror?: boolean): number {
        // locals start with 0
        const index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {
            if (noerror) {
                return index;
            }

            throw new Error('Can\'t find local: ' + name);
        }

        return this.locals[index].register;
    }

    public findLocal(name: string, noerror?: boolean): number {
        // locals start with 0
        let index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {

            // try to find it in other scopes
            for (let i = this.local_scopes.length - 1; i >= 0; i--) {
                index = this.local_scopes[i].findIndex(e => e.name === name);
                if (index !== -1) {
                    return this.local_scopes[i][index].register;
                }
            }

            if (noerror) {
                return index;
            }

            throw new Error('Can\'t find local: ' + name);
        }

        return this.locals[index].register;
    }

    public isRegisterLocal(register: number): boolean {
        // locals start with 0
        let index = this.locals.findIndex(e => e.register === register);
        if (index === -1) {

            // try to find it in other scopes
            for (let i = this.local_scopes.length - 1; i >= 0; i--) {
                index = this.local_scopes[i].findIndex(e => e.register === register);
                if (index !== -1) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    public findOrCreateConst(value: any): number {
        // consts start with 1
        const index = this.constants.findIndex(e => e === value);
        if (index === -1) {
            this.constants.push(value);
            return this.constants.length;
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

    public useRegisterAndPush(): ResolvedInfo {
        const resolvedInfo = this.useRegister();
        this.stack.push(resolvedInfo);
        return resolvedInfo;
    }

    public popRegister(resolvedInfo: ResolvedInfo): void {
        if (resolvedInfo.kind === ResolvedKind.Register && resolvedInfo.register !== undefined && !resolvedInfo.isLocal()) {
            if ((this.availableRegister - resolvedInfo.getRegister()) > 1) {
                throw new Error('available register and restored register are to far (> 1)');
            }

            this.availableRegister = resolvedInfo.getRegister();
        }
    }
}
