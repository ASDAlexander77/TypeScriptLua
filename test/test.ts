import './JS';

class Test {

    private subMeshes: any;

    public test() {
        if (!this.subMeshes) {
            return;
        }

        console.log('Not Working');
    }

}

const t = new Test();
t.test();
