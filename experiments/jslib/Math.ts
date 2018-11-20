declare var math: any;

module TS {
    export class Math {
        public PI = 3.141592653589793;

        public static pow(op: number, op2: number): number {
            return op ** op2;
        }

        public static min(op: number): number {
            return math.min(op);
        }

        public static max(op: number): number {
            return math.max(op);
        }

        public static sin(op: number): number {
            return math.sin(op);
        }

        public static cos(op: number): number {
            return math.cos(op);
        }

        public static asin(op: number): number {
            return math.asin(op);
        }

        public static acos(op: number): number {
            return math.acos(op);
        }

        public static abs(op: number): number {
            return math.abs(op);
        }

        public static floor(op: number): number {
            return math.floor(op);
        }

        public static round(op: number): number {
            return math.round(op);
        }

        public static sqrt(op: number): number {
            return math.sqrt(op);
        }

        public static tan(op: number): number {
            return math.tan(op);
        }

        public static atan(op: number): number {
            return math.atan(op);
        }

        public static atan2(op: number): number {
            return math.atan(op);
        }

        public static log(op: number): number {
            return math.log(op);
        }

        public static random(): number {
            return math.random();
        }
    }
}
