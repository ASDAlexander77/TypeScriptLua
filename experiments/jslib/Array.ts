declare var table: any;
declare var len: any;
declare var ret: any;
declare var __len__: any;
declare var __get_call_undefined__: any;
declare var __set_call_undefined__: any;
declare var rawget: any;
declare var rawset: any;

module JS {

    export class ArrayHelper {
        @len
        public static getLength(_this: any[] | Array<any>): number {
            // implemented in the compiler
            throw 0;
        }

        public static pushOne<T>(_this: any[] | Array<T>, obj: T) {
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

        public constructor(size?: number) {
            const zeroVal = rawget(this, 0);
            if (zeroVal !== null || rawget(this, 1) !== null) {
                if (zeroVal !== null) {
                    delete this[0];
                }

                // @ts-ignore
                const _len = ArrayHelper.getLength(this);

                if (zeroVal !== null) {
                    table.insert(this._values, zeroVal);
                }

                for (let i = 1; i <= _len; i++) {
                    table.insert(this._values, rawget(this, i));
                }

                for (let i = _len; i > 0; i--) {
                    table.remove(this, i);
                    delete this[i];
                }

                // @ts-ignore
                rawset(this, 'length', null);
            }

            // @ts-ignore
            this.__tostring = function (): string {
                return this.join();
            };

            // @ts-ignore
            this.__ipairs = Array.__ipairsFunc;
            // @ts-ignore
            this.__pairs = Array.__pairsFunc;

            // @ts-ignore
            this.__index = function (_this: Array<T>, indx: number | string): any {
                // @ts-ignore
                // tslint:disable-next-line:triple-equals
                if (typeof (indx) === 'number') {
                    // @ts-ignore
                    const v = rawget(_this._values, indx + 1);
                    // @ts-ignore
                    return typeof (v) === 'object' && (<any>v).isNull ? null : v === null ? undefined : v;
                }

                // @ts-ignore
                return __get_call_undefined__(_this, indx);
            };

            // @ts-ignore
            this.__newindex = function (_this: Array<T>, indx: number | string, val: T): void {
                // @ts-ignore
                // tslint:disable-next-line:triple-equals
                if (typeof (indx) === 'number') {
                    rawset(_this._values, indx + 1, val);
                    return;
                }

                // @ts-ignore
                __set_call_undefined__(_this, indx, val);
            };

            if (size) {
                this.length = size;
            }
        }

        /*
        @ret(3)
        static __ipairsFunc(_this: Array<T>) {
            // @ts-ignore
            return ipairs(_this._values);
        }

        @ret(3)
        static __pairsFunc(_this: Array<T>) {
            // @ts-ignore
            return pairs(_this._values);
        }
        */

        public push(...objs: T[]) {
            let any = false;
            for (const obj of objs) {
                any = true;
                table.insert(this._values, obj !== null ? obj : ArrayNullElement);
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

            const v = table.remove(this._values);
            // @ts-ignore
            return typeof (v) === 'object' && (<any>v).isNull ? null : v === null ? undefined : v;
        }

        public get length(): number {
            return ArrayHelper.getLength(this._values);
        }

        public set length(newSize: number) {
            const _len = ArrayHelper.getLength(this._values);
            if (_len === newSize) {
                return;
            }

            if (newSize < _len) {
                for (let i = _len; i >= newSize; i--) {
                    table.remove(this._values, i);
                }
            } else {
                for (let i = _len + 1; i <= newSize; i++) {
                    table.insert(this._values, i, ArrayNullElement);
                }
            }
        }

        public indexOf(val: T): number {
            const vals = this._values;
            const length_ = ArrayHelper.getLength(vals);
            for (let i = 1; i <= length_; i++) {
                // tslint:disable-next-line:triple-equals
                if (rawget(vals, i) == val) {
                    return i - 1;
                }
            }

            return -1;
        }

        public join(): string {
            return table.concat(this._values);
        }

        public sort() {
            table.sort(this._values);
        }

        public shift(): T {
            const v = table.remove(this._values, 1);
            // @ts-ignore
            return typeof (v) === 'object' && (<any>v).isNull ? null : v == null ? undefined : v;
        }

        public unshift(...objs: T[]) {
            const vals = this._values;
            for (const obj of objs) {
                table.insert(vals, obj);
            }
        }

        public concat(other: T[]): T[] {
            const retArr = new Array<T>();

            const _vals = this._values;
            const _len = ArrayHelper.getLength(_vals);
            for (let i = 1; i <= _len; i++) {
                table.insert(retArr._values, _vals[i]);
            }

            for (const obj of other) {
                table.insert(retArr._values, obj);
            }

            // @ts-ignore
            return retArr;
        }

        public remove(obj: T) {
            const idx = this.indexOf(obj);
            if (idx !== -1) {
                table.remove(this._values, idx + 1);
            }
        }

        public map(func: (currentValue: T, index: number, arr: T[]) => T, thisValue?: any): T[] {
            const retArr = new Array<T>();

            let index = 0;
            const _vals = this._values;
            const _len = ArrayHelper.getLength(_vals);
            for (let i = 1; i <= _len; i++) {
                // @ts-ignore
                const obj = func(_vals[i], index++, this);
                // @ts-ignore
                ArrayHelper.pushOne(retArr, obj);
            }

            // @ts-ignore
            return retArr;
        }

        public filter(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): T[] {
            const retArr = new Array<T>();

            let index = 0;
            const _vals = this._values;
            const _len = ArrayHelper.getLength(_vals);
            for (let i = 1; i <= _len; i++) {
                const val = _vals[i];
                // @ts-ignore
                const iftrue = func(val, index++, this);
                if (iftrue) {
                    // @ts-ignore
                    ArrayHelper.pushOne(ret, val);
                }
            }

            // @ts-ignore
            return retArr;
        }

        public forEach(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): void {
            let index = 0;
            const _vals = this._values;
            const _len = ArrayHelper.getLength(_vals);
            for (let i = 1; i <= _len; i++) {
                const val = _vals[i];
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
            const retArr = new Array<T>();
            for (let i = index + count; i > index; i--) {
                // @ts-ignore
                ArrayHelper.pushOne(retArr, rawget(this._values, i));
                table.remove(this._values, i);
            }

            if (items) {
                const length_ = ArrayHelper.getLength(items);
                for (let i = 0; i < length_; i++) {
                    const ind = i + index + 1;
                    table.insert(this._values, ind, items[i]);
                }
            }

            // @ts-ignore
            return retArr;
        }

        public slice(begin?: number, end?: number): T[] {
            const retArr = new Array<T>();

            const from = begin || 0;
            if (from < 0) {
                throw new Error(`Index out of bounds: ${from}`);
            }

            let to = end || this.length;
            if (to > this.length) {
                to = this.length;
            }

            for (let i = from; i < to; i++) {
                table.insert(retArr, rawget(this._values, i));
            }

            // @ts-ignore
            return retArr;
        }

    }

}
