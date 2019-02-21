import './JS';

class Vector3 {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0
    ) {
        console.log('called');
    }
}

var v = new Vector3();
console.log(v.x);
console.log(v.y);
console.log(v.z);

class Vector4 {
}

var v1 = new Vector4();
