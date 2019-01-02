import './JS';

class Test {
    /**
     * test
     */
    val = 10;

    public testMethod() {
        console.log('method call');
        console.log(this.val);
    }
}

const t = new Test();
/*
t.testMethod();

function __wrapper(_this: any, method: any) {
    return function () {
        method(_this);
    };
}

const m = __wrapper(t, t.testMethod);
m();
*/

const m2 = t.testMethod;
m2();
