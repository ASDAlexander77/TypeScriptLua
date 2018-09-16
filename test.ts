class Class1 {
    constructor(private i: number) {
        console.log("constructor");
    }

    public show() {
	console.log("show");
        console.log(this.i);
    }
}

let c = new Class1(1);
console.log("call show");
c.show();
