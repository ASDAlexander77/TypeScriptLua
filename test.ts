class Class1 {
	public method1(): boolean {
		return false;
	}
}

class Class2 extends Class1 {
	public method1(): boolean {
		return super.method1();
	}

}

const c2 = new Class2();
console.log(c2.method1());
