declare var table: any;
declare var len: any;
declare var __len__: any;

module JS {

    export class ArrayHelper {
        @len
        public static getLength(_this: any[]): number {
            // implemented in the compiler
            throw 0;
        }

        public static pushOne(_this: any[], obj: any) {
            const vals = (<any>_this)._values;
            if (vals) {
                table.insert(vals, obj);
                return;
            }

            if (!_this[0]) {
                _this[0] = obj;
                return;
            }

            table.insert(_this, obj);
        }
    }

    export class ArrayNullElement {
        public static isNull = true;

        public static __tostring(): string {
            return 'null';
        }
    }

    setmetatable(ArrayNullElement, ArrayNullElement);

    export class Array<T> {

        [k: number]: T;

        // this is Hack, otherwise it will cause recusive calling of Array.constructor
        private _values: T[] = <T[]>{};

        public constructor() {
            // @ts-ignore
            this.__tostring = function (): string {
                return this.join();
            };

            // @ts-ignore
            this.__index = function (_this: Array<T>, indx: number | string): any {
                // @ts-ignore
                // tslint:disable-next-line:triple-equals
                if (typeof(indx) == 'number') {
                    // @ts-ignore
                    const v = _this._values[indx + 1];
                    // @ts-ignore
                    // tslint:disable-next-line:triple-equals typeof-compare
                    return typeof(v) == 'table' && (<any>v).isNull ? null : v;
                }

                // @ts-ignore
                return __get_call__(_this, indx);
            };
        }

        public push(...objs: T[]) {
            let any = false;
            for (const obj of objs) {
                any = true;
                table.insert(this._values, obj);
            }

            if (!any) {
                table.insert(this._values, ArrayNullElement);
            }
        }

        public pop() {
            const l = this._values.length;
            if (l === 0) {
                throw new Error('Out of items');
            }

            const v0 = table.remove(this._values);
            // @ts-ignore
            // tslint:disable-next-line:triple-equals typeof-compare
            return typeof(v0) == 'table' && (<any>v0).isNull ? null : v0;
        }

        @len
        public get length(): number {
            // implemented in the compiler
            throw 0;
        }

        public indexOf(val: T): number {
            const vals = this._values;
            const length_ = vals.length;
            for (let i = 0; i < length_; i++) {
                // tslint:disable-next-line:triple-equals
                if (vals[i] == val) {
                    return i;
                }
            }

            return -1;
        }

        public join(): string {
            return table.concat(this._values);
        }

        public shift(): T {
            return (table.remove(this._values, 1));
        }

        public unshift(...objs: T[]) {
            const vals = this._values;
            for (const obj of objs) {
                table.insert(vals, obj);
            }
        }

        public concat(other: T[]): T[] {
            const ret = new Array<T>();

            for (const obj of this._values) {
                table.insert(ret._values, obj);
            }

            for (const obj of other) {
                table.insert(ret, obj);
            }

            // @ts-ignore
            return ret;
        }

        public map(func: (currentValue: T, index: number, arr: T[]) => T, thisValue?: any): T[] {
            const ret = new Array<T>();

            let index = 0;
            for (const val of this._values) {
                // @ts-ignore
                const obj = func(val, index++, this);
                // @ts-ignore
                ArrayHelper.pushOne(ret, obj);
            }

            // @ts-ignore
            return ret;
        }

        public filter(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): T[] {
            const ret = new Array<T>();

            let index = 0;
            for (const val of this._values) {
                // @ts-ignore
                const iftrue = func(val, index++, this);
                if (iftrue) {
                    // @ts-ignore
                    ArrayHelper.pushOne(ret, val);
                }
            }

            // @ts-ignore
            return ret;
        }

        public forEach(func: (currentValue: T, index: number, arr: T[]) => void, thisValue?: any): void {
            let index = 0;
            for (const val of this._values) {
                // @ts-ignore
                func(val, index++, this);
            }
        }

        public every(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): void {
            let index = 0;
            let result = true;
            for (const val of this._values) {
                // @ts-ignore
                result &= func(val, index++, this);
            }

            // @ts-ignore
            return result;
        }

        public splice(index: number, howmany?: number, ...items: T[]): T[] {
            const count = howmany || 1;
            const ret = new Array<T>();
            for (let i = index + count - 1; i >= index; i--) {
                // @ts-ignore
                ArrayHelper.pushOne(ret, this[i]);
                table.remove(this._values, i);
            }

            if (items) {
                const length_ = ArrayHelper.getLength(items);
                for (let i = 0; i < length_; i++) {
                    const ind = i + index;
                    table.insert(this._values, ind, items[i]);
                }
            }

            // @ts-ignore
            return ret;
        }

        public slice(begin?: number, end?: number): T[] {
            const ret = new Array<T>();

            const from = begin || 0;
            let to = end || this.length;
            if (to > this.length) {
                to = this.length;
            }

            for (let i = from; i < to; i++) {
                table.insert(ret, this._values[i]);
            }

            // @ts-ignore
            return ret;
        }

    }

}
