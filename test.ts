class Class1 {
    private i: number;

    constructor(pi: number) {
	this.i = pi;
    }

    public show() {
        console.log(this.i);
    }
}

let c = new Class1(1);
c.show();
