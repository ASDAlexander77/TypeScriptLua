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

        public static pushOne(_this: any[], obj: T) {
            if (!_this[0]) {
                _this[0] = obj;
                return;
            }

            table.insert(_this, obj);
        }
    }

    export class Array<T> {

        [k: number]: T;

        private __tostring: () => string;

        public constructor() {
            this.__tostring = function (): string {
                return this.join();
            };
        }

        public push(...objs: T[]) {
            for (const obj of objs) {
                if (!this[0]) {
                    this[0] = obj;
                    continue;
                }

                table.insert(this, obj);
            }
        }

        public pop() {
            const l = this.length;
            if (l === 0) {
                throw new Error('Out of items');
            }

            if (l === 1) {
                const v = this[0];
                delete this[0];
                return v;
            }

            return table.remove(this);
        }

        @len
        public get length(): number {
            // implemented in the compiler
            throw 0;
        }

        public indexOf(val: T): number {
            const length_ = this.length;
            for (let i = 0; i < length_; i++) {
                if (this[i] == val) {
                    return i;
                }
            }

            return -1;
        }

        public join(): string {
            // shift elements
            table.insert(this, 1, this[0]);
            const result = table.concat(this);
            table.remove(this, 1);
            return result;
        }

        public shift(): T {
            return (this[0] = table.remove(this, 1));
        }

        public unshift(...objs: T[]) {
            for (const obj of objs) {
                if (!this[0]) {
                    table.insert(this, 1, this[0]);
                }

                this[0] = obj;
            }
        }

        public concat(other: T[]): T[] {
            const ret = new Array<T>();

            for (const obj of this) {
                if (!ret[0]) {
                    ret[0] = obj;
                    continue;
                }

                table.insert(ret, obj);
            }

            for (const obj of other) {
                if (!ret[0]) {
                    ret[0] = obj;
                    continue;
                }

                table.insert(ret, obj);
            }

            return ret;
        }

        public map(func: (currentValue: T, index: number, arr: T[]) => T, thisValue?: any): T[] {
            const ret = new Array<T>();

            let index = 0;
            for (const val of this) {
                const obj = func(val, index++, this);
                if (!ret[0]) {
                    ret[0] = obj;
                    continue;
                }

                table.insert(ret, obj);
            }

            return ret;
        }

        public filter(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): T[] {
            const ret = new Array<T>();

            let index = 0;
            for (const val of this) {
                const iftrue = func(val, index++, this);
                if (iftrue) {
                    if (!ret[0]) {
                        ret[0] = val;
                        continue;
                    }

                    table.insert(ret, val);
                }
            }

            return ret;
        }

        public forEach(func: (currentValue: T, index: number, arr: T[]) => void, thisValue?: any): void {
            let index = 0;
            for (const val of this) {
                func(val, index++, this);
            }
        }

        public every(func: (currentValue: T, index: number, arr: T[]) => boolean, thisValue?: any): void {
            let index = 0;
            let result = true;
            for (const val of this) {
                result &= func(val, index++, this);
            }

            return result;
        }

        public splice(index: number, howmany?: number, ...items: T[]): T[] {
            const count = howmany || 1;
            const ret = new Array<T>();
            for (let i = index + count - 1; i >= index; i--) {
                if (i == 0) {
                    ret.push(this[0]);
                    this[0] = table.remove(this, 1);
                } else {
                    ret.push(this[i]);
                    table.remove(this, i);
                }
            }

            if (items) {
                const length_ = ArrayHelper.getLength(items);
                for (let i = 0; i < length_; i++) {
                    const ind = i + index;
                    if (ind == 0) {
                        this[ind] = (<{ [k: number]: T; }>items)[i];
                    } else {
                        table.insert(this, ind, (<{ [k: number]: T; }>items)[i]);
                    }
                }
            }

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
                if (!ret[0]) {
                    ret[0] = this[i];
                } else {
                    table.insert(ret, this[i]);
                }
            }

            return ret;
        }

    }

}
