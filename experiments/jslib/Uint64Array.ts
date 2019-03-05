module JS {

    export class Uint64Array extends TypedArrayBase {

        public static TYPE = 'int64';
        public static BYTES_PER_ELEMENT = 8;

        public constructor(sizeOrData: number | Array<number>) {
            // @ts-ignore
            super(sizeOrData, Uint64Array.BYTES_PER_ELEMENT, Uint64Array.TYPE);
        }
    }

}
