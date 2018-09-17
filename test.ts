class Person {
}

let howard = new Person();
if (howard) {
	console.log("cool");
}

howard = null;
if (!howard) {
	console.log("cool2");
}
