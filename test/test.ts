import './JS';

class Test {
    public constructor(private name: string) {
        console.log("Hello.");
    }
}

class Test2 extends Test {
}

const c = new Test2("asd");
