module JS {

    export class TypedArrayBase {
        size: number;
        byteLength: number;
        data: number[];

        public buffer: ArrayBuffer;

        protected get: (b: any, i: number) => number;
        protected set: (b: any, i: number, val: number) => void;

        public constructor(
            sizeOrData: number | number[],
            protected sizePerElement: number,
            protected type: string,
            ) {

            if (!array_buffer) {
                // @ts-ignore
                import array_buffer from 'array_buffer';
            }

            // set/get
            switch (type) {
                case 'int8':
                    this.get = array_buffer.getInt8;
                    this.set = array_buffer.setInt8;
                    break;
                case 'int16':
                    this.get = array_buffer.getInt16;
                    this.set = array_buffer.setInt16;
                    break;
                case 'int32':
                    this.get = array_buffer.getInt32;
                    this.set = array_buffer.setInt32;
                    break;
                case 'int64':
                    this.get = array_buffer.getInt64;
                    this.set = array_buffer.setInt64;
                    break;
                case 'float':
                    this.get = array_buffer.getFloat;
                    this.set = array_buffer.setFloat;
                    break;
                case 'double':
                    this.get = array_buffer.getDouble;
                    this.set = array_buffer.setDouble;
                    break;
                default:
                    this.get = array_buffer.get;
                    this.set = array_buffer.set;
                    break;
            }

            let data;
            // tslint:disable-next-line:triple-equals
            const isSize = typeof(sizeOrData) == 'number';
            if (isSize) {
                this.size = <number>sizeOrData;
                this.byteLength = <number>sizeOrData * sizePerElement;
            } else {
                data = sizeOrData;
                this.size = (<ArrayHelper>sizeOrData).getLength();
                this.byteLength = this.size * sizePerElement;
            }

            this.buffer = new ArrayBuffer(this.byteLength);
            if (!isSize) {
                // copy data
                const bufferNative = this.buffer.bufferNativeInstance;

                const setFunc = this.set;
                let index = 0;
                // @ts-ignore
                for (const val of data) {
                    setFunc(bufferNative, index++, val);
                }
            }

        }

        public static getGetter() {

        }
    }

}
