module JS {

    export class Float64Array extends TypedArrayBase {

        public static TYPE = 'double';
        public static BYTES_PER_ELEMENT = 8;

        public constructor(sizeOrData: number | Array<number>) {
            // @ts-ignore
            super(sizeOrData, Float64Array.BYTES_PER_ELEMENT, Float64Array.TYPE);
        }
    }

}
