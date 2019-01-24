module JS {

    export class Uint16Array extends TypedArrayBase {

        public static TYPE = 'int16';
        public static BYTES_PER_ELEMENT = 2;

        public constructor(sizeOrData: number | Array<number>) {
            // @ts-ignore
            super(sizeOrData, Uint16Array.BYTES_PER_ELEMENT, Uint16Array.TYPE);
        }
    }

}
