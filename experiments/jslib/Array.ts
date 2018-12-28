declare var table: any;
declare var len: any;
declare var __len__: any;

module JS {

    export class Array<T> {

        [k: number]: T;

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
            const l = this.length();
            if (l === 0) {
                throw 'Out of items';
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

        public splice(index: number, howmany?: number, ...items: T[]): T[] {
            const count = howmany || 1;
            const ret = new Array<T>();
            for (let i = index + count; i < count; i--) {
                if (i == 0) {
                    ret.push(this[0]);
                    delete this[0];
                } else {
                    ret.push(this[i]);
                    table.remove(this, i);
                }
            }

            if (items) {
                const length_ = items.length;
                for (let i = 0; i < length_; i++) {
                    const ind = i + index;
                    if (ind == 0) {
                        this[ind] = items[i];
                    } else {
                        table.insert(this, ind, items[i]);
                    }
                }
            }

            return ret;
        }
    }

}
