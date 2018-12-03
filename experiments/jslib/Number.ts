declare var tostring: any;

module TS {

    export class NumberHelper {
        public static toString(constNumber: number, ...params: any[]): string {
            return tostring(constNumber);
        }
    }

    export class Number {
        public static MAX_VALUE = 1.7976931348623157e+308;
        public static MIN_VALUE = 5e-324;
    }
}
