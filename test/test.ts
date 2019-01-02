import './JS';

class Test {
    val = 10;

    public testMethod() {
        console.log(this.val);
    }
}

const t = new Test();
const m2 = t.testMethod;
m2();

const padStr = (i: number) => (i < 10) ? "0" + i : "" + i;
console.log("[" + padStr(1) + "]:"));