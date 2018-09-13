class Class1 {
    public show(s: string) {
	console.log("Hello");
	console.log(s);
    }

    public static show2(s: string) {
	console.log("Hello");
	console.log(s);
    }
}

Class1.show2('asd2');

let c = new Class1();
c.show("Hello2");
