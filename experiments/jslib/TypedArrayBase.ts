module JS {

    export class TypedArrayBase {
        size: number;
        byteLength: number;
        data: number[];

        protected constructor(sizeOrData: number | number[], protected sizePerElement: number) {
            if (typeof(sizeOrData) == 'number') {
                this.size = sizeOrData;
                this.byteLength = sizeOrData * sizePerElement;
            } else {
                this.data = sizeOrData;
                this.size = ArrayHelper.getLength(sizeOrData);
                this.byteLength = this.size * sizePerElement;
            }
        }
    }

}
