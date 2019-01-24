module JS {

    export class ArrayBuffer {

        public bufferNativeInstance: any;

        public constructor(sizeBytes: number) {

            if (!array_buffer) {
                // @ts-ignore
                import array_buffer from 'array_buffer';
            }

            if (!array_buffer) {
                throw new Error('array_buffer module is not available');
            }

            const bufferNativeInstance = this.bufferNativeInstance = array_buffer.new(sizeBytes);
        }
    }
}
