class Class1 {
	private show(s: string) {
		console.log(s);
	}
}

class Class2 extends Class1 {
}

class Class3 {
}

let c2 = new Class2();
console.log(Class1);
console.log(Class2);

if (Class1 == Class2) {
	console.log("NOT WORKING 1");
}

if (Class1 == Class1) {
	console.log("WORKING 1");
}

console.log("instance of ========>");
console.log(c2 instanceof Class1);
