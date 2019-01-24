module JS {

    export class Uint8Array extends TypedArrayBase {

        public static TYPE = 'int8';
        public static BYTES_PER_ELEMENT = 1;

        public constructor(sizeOrData: number | Array<number>) {
            // @ts-ignore
            super(sizeOrData, Uint8Array.BYTES_PER_ELEMENT, Uint8Array.TYPE);
        }
    }

}
