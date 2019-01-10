import './JS';

class Test {
    public run() {
        const s = '20';
        this.run2(10, (x) => {
            this.run3(x, (y) => {
                this.run4(y);
                console.log(s);
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
