import './JS';

class Vector3 {
    constructor(
        public r: number = 0,
        public g: number = 0,
        public b: number = 0) {
    }

    public static Zero(): Vector3 {
        return new Vector3(0.0, 0.0, 0.0);
    }
}

class MathTmp {
    public static Vector3: Vector3[] = [Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero()];
}

console.log(MathTmp.Vector3[0].r);
