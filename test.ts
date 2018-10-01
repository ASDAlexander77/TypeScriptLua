export class Matrix {
    public static _updateFlagSeed = 0;

    public _markAsUpdated() {
        Matrix._updateFlagSeed++;
    }

    public constructor() {
        this._markAsUpdated();
    }
}

new Matrix();
console.log(Matrix._updateFlagSeed);
