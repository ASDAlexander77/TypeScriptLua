class Class1 {
    public method1(): boolean {
        return false;
    }
}

class Class2 extends Class1 {
}

const c = new Class2();
console.log(c.method1());
