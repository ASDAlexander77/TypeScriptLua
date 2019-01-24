module JS {

    export class TypedArrayBase {
        size: number;
        byteLength: number;
        data: number[];

        public buffer: ArrayBuffer;

        public constructor(
            sizeOrData: number | number[],
            protected sizePerElement: number,
            protected get: (b: any, i: number) => number, protected set: (b: any, i: number, val: number) => void) {

            if (!array_buffer) {
                // @ts-ignore
                import array_buffer from 'array_buffer';
            }

            let data;
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

                const setFunc = this.set;
                let index = 0;
                for (const val of data) {
                    setFunc(bufferNative, index++, val);
                }
            }

        }
    }

}
