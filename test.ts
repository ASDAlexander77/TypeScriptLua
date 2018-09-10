console.log('class 1');
class Class1 {
    public method1(): boolean {
	console.log('in method1');
        return false;
    }
}

console.log('class 2');
class Class2 extends Class1 {
}

console.log('new class 1');

const c1 = new Class1();

console.log(c1.method1());

console.log('new class 2');

const c2 = new Class2();

console.log('call method 1');

console.log(c2.method1());
