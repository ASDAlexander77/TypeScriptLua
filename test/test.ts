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

const center = new Vector3();
const maximum = new Vector3();
const minimum = new Vector3();
center.copyFrom(maximum).addInPlace(minimum).scaleInPlace(0.5);
console.log('Run1');
