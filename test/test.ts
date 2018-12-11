class Vector3 {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0
    ) {
    }

    public addInPlace(otherVector: Vector3): Vector3 {
        this.x += otherVector.x;
        this.y += otherVector.y;
        this.z += otherVector.z;
        return this;
    }

    public scaleInPlace(scale: number): Vector3 {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
        return this;
    }

    public copyFrom(source: Vector3): Vector3 {
        this.x = source.x;
        this.y = source.y;
        this.z = source.z;
        return this;
    }

    public get isNonUniform(): boolean {
        const absX = Math.abs(this.x);
        const absY = Math.abs(this.y);
        if (absX !== absY) {
            return true;
        }

        return false;
    }
}

class Run1 {
    private maximum: Vector3 = new Vector3();
    private minimum: Vector3 = new Vector3();
    public exec() {
        const center: Vector3 = new Vector3();
        center.copyFrom(this.maximum).addInPlace(this.minimum).scaleInPlace(0.5);
    }
}

const r = new Run1();
r.exec();

console.log('Run1');
