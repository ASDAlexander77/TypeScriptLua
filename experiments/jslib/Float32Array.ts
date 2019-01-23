module JS {

    export class Float32Array extends TypedArrayBase {

        public static BYTES_PER_ELEMENT = 4;

        public constructor(sizeOrData: number | Array<number>) {
            super(sizeOrData, Float32Array.BYTES_PER_ELEMENT);
        }
    }

}
