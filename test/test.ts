import './JS';

let a;

class A {
    private a: any;
    private b = "1";
    private static c = "2";
}

const a1 = new A();


if (a) {
	console.log("should not be called");
}
