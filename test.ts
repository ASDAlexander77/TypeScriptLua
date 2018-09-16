class Class1 {
    constructor(private i: number) {
    }

    public show() {
        console.log(this.i);
    }
}

let c = new Class1(1);
c.show();
