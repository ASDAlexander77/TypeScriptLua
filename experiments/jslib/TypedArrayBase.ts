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
            let setFunc;
            let getFunc;
            switch (type) {
                case 'int8':
                    getFunc = array_buffer.getInt8;
                    setFunc = array_buffer.setInt8;
                    break;
                case 'int16':
                    getFunc = array_buffer.getInt16;
                    setFunc = array_buffer.setInt16;
                    break;
                case 'int32':
                    getFunc = array_buffer.getInt32;
                    setFunc = array_buffer.setInt32;
                    break;
                case 'int64':
                    getFunc = array_buffer.getInt64;
                    setFunc = array_buffer.setInt64;
                    break;
                case 'float':
                    getFunc = array_buffer.getFloat;
                    setFunc = array_buffer.setFloat;
                    break;
                case 'double':
                    getFunc = array_buffer.getDouble;
                    setFunc = array_buffer.setDouble;
                    break;
                default:
                    getFunc = array_buffer.get;
                    setFunc = array_buffer.set;
                    break;
            }

            this.get = getFunc;
            this.set = setFunc;

            let data;
            // tslint:disable-next-line:triple-equals
            const isSize = typeof(sizeOrData) == 'number';
            if (isSize) {
                this.size = <number>sizeOrData;
                this.byteLength = <number>sizeOrData * sizePerElement;
            } else {
                data = sizeOrData;
                this.size = ArrayHelper.getLength(sizeOrData);
                this.byteLength = this.size * sizePerElement;
            }

            this.buffer = new ArrayBuffer(this.byteLength);
            if (!isSize) {
                // copy data
                const bufferNative = this.buffer.bufferNativeInstance;

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
