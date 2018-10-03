class Node {
    constructor() {
    }
}

class Test extends Node {
    public metadata: any = null;

    constructor() {
        super();
    }

    public get x() {
        return 1;
    }
}

new Test();
