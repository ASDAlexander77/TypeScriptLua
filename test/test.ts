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

/*
// tslint:disable-next-line:no-construct
const sc = new String('ABC');
console.log(sc);

const s = 'asd';

function f(p: any) {
    console.log(p.substr(0, 1));
}

f(s);
*/
