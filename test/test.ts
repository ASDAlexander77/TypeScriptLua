import './JS';

class Test {
    public run() {
        this.run2(10, (x) => {
            this.run3(x, (y) => {
                this.run4(y);
            });
        });
    }

    public run2(x, callback: (data: any) => void) {
        callback(x);
    }

    public run3(x, callback: (data: any) => void) {
        callback(x);
    }

    public run4(x) {
        console.log(x);
    }
}

const t = new Test();
t.run();
