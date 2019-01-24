module JS {

    export class Uint32Array extends TypedArrayBase {

        public static TYPE = 'int32';
        public static BYTES_PER_ELEMENT = 4;

        public constructor(sizeOrData: number | Array<number>) {
            // @ts-ignore
            super(sizeOrData, Uint32Array.BYTES_PER_ELEMENT, Uint32Array.TYPE);
        }
    }

}
