module JS {

    export class Float32Array extends TypedArrayBase {
        public constructor(size: number) {
            super(size, 4);
        }
    }

}
