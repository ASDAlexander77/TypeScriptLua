export class SmartArray<T> {
    // Statics
    private static _GlobalId = 0;

    public data: Array<T>;
    public length = 0;

    protected _id: number;

    [index: number]: T;

    constructor(capacity: number) {
        this.data = new Array(capacity);
        this._id = SmartArray._GlobalId++;
    }

    public push(value: T): void {
        this.data[this.length++] = value;

        if (this.length > this.data.length) {
            this.data.length *= 2;
        }
    }

    public forEach(func: (content: T) => void): void {
        for (let index = 0; index < this.length; index++) {
            func(this.data[index]);
        }
    }

    public sort(compareFn: (a: T, b: T) => number): void {
        this.data.sort(compareFn);
    }

    public reset(): void {
        this.length = 0;
    }

    public dispose(): void {
        this.reset();

        if (this.data) {
            this.data.length = 0;
            this.data = [];
        }
    }

    public concat(array: any): void {
        if (array.length === 0) {
            return;
        }
        if (this.length + array.length > this.data.length) {
            this.data.length = (this.length + array.length) * 2;
        }

        for (let index = 0; index < array.length; index++) {
            this.data[this.length++] = (array.data || array)[index];
        }
    }

    public indexOf(value: T): number {
        const position = this.data.indexOf(value);

        if (position >= this.length) {
            return -1;
        }

        return position;
    }

    public contains(value: T): boolean {
        return this.data.indexOf(value) !== -1;
    }
}

let a = new SmartArray(2);
console.log(a[1]);
