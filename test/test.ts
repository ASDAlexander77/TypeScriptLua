import './JS';

class Test {
    /**
     * test
     */
    val = 10;

    public test() {
        console.log('method call');
        console.log(this.val);
    }
}

function __wrapper(_this: any, method: any) {
    return function () {
        method(_this);
    };
}

const t = new Test();
/*
t.test();

const m = __wrapper(t, t.test);
m();
*/

const m2 = t.test;
m2();
