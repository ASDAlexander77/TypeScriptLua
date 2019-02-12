class Matrix {
    private static _updateFlagSeed = 0;

    public updateFlag: number;

    public constructor() {
        this._markAsUpdated();
    }

    public _markAsUpdated() {
        this.updateFlag = Matrix._updateFlagSeed++;
    }
}

const m = new Matrix();
print(m.updateFlag);
