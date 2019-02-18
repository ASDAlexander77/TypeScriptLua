import './JS';

let a;

class A {
    private a: any;
    private b = "1";
    private static c = "2";

    public static methodStatic1() {
        console.log('static');
    }

    public method1() {
        console.log('method');
    }
}

A.methodStatic1();

const a1 = new A();
a1.method1();


if (a) {
	console.log("should not be called");
}
