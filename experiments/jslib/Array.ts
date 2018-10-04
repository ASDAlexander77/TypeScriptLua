declare var table: any;
declare var len: any;
declare var __len__: any;

module JS {

    export class Array<T> {

        [k: number]: T;

        public push(obj: T) {
            table.insert(this, obj);
        }

        public pop() {
            return table.remove(this);
        }

        @len
        public get length(): number {
            // implemented in the compiler
            throw 0;
        }
    }

}
