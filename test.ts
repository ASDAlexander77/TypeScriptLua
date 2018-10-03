export interface IBehaviorAware<T> {
    init(): void;
}

class Node implements IBehaviorAware<Node> {
    public metadata: any = null;

    public animations = new Array<Animation>();

    constructor(scene: any = null) {
    }

    public init() {
    }

    public get x() {
        return 1;
    }
}

class Test extends Node {
    constructor() {
        super();
    }

    public get x2() {
        return 2;
    }
}

new Test();
