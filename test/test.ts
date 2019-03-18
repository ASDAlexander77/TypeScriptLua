import './JS';

class Test1 {
    public test() {
        this.getNewPosition(this._onCollisionPositionChange);
    }

    private _onCollisionPositionChange = (collisionId: number) => {
        console.log(collisionId);
        console.log(this);
    }

    public getNewPosition(onNewPosition: (collisionIndex: number) => void): void {
        onNewPosition(1);
    }
}

const c = new Test1();
c.test();

