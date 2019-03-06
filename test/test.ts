import './JS';

class Test {
    public constructor(private name: string) {
        console.log(this.name);
    }
}

class Test2 extends Test {
    protected abstract _abstr(): void;
}

class Test3 extends Test2 {
}

const c = new Test3("asd");
console.log(c.name);

