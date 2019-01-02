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

const m = __wrapper(t, t.testMethod);
m();

function __wrapper(method: any, _this: any) {
    return function () {
        method(_this);
    };
}
*/

const m2 = t.testMethod;
m2();
