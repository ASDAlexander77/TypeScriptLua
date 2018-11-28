declare var print;

class Vector3 {
    constructor(
        public x: number = 0
    ) { }
}

const v = new Vector3();
print(v.x);
