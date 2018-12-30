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

const t = new Test();
t.test();

