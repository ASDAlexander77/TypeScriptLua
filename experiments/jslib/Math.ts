declare var math: any;

module TS {
    export class Math {
        public PI = 3.141592653589793;

        public pow(op: number, op2: number): number {
            return op ** op2;
        }

        public min(op: number): number {
            return math.min(op);
        }

        public max(op: number): number {
            return math.max(op);
        }

        public sin(op: number): number {
            return math.sin(op);
        }

        public cos(op: number): number {
            return math.cos(op);
        }

        public asin(op: number): number {
            return math.asin(op);
        }

        public acos(op: number): number {
            return math.acos(op);
        }

        public abs(op: number): number {
            return math.abs(op);
        }

        public floor(op: number): number {
            return math.floor(op);
        }

        public round(op: number): number {
            return math.round(op);
        }

        public sqrt(op: number): number {
            return math.sqrt(op);
        }

        public tan(op: number): number {
            return math.tan(op);
        }

        public atan(op: number): number {
            return math.atan(op);
        }

        public atan2(op: number): number {
            return math.atan(op);
        }

        public log(op: number): number {
            return math.log(op);
        }

        public random(): number {
            return math.random();
        }
    }
}
