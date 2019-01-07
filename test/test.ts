import './JS';

class Test {
    public m: (val: number) => void;

    public constructor() {
        this.m = Test.staticMethodTest;
    }

    public static staticMethodTest(val2: number) {
        console.log(val2);
    }

    public run() {
        this.m(10);
    }
}

const t = new Test();
t.run();
