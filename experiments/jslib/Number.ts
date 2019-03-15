declare var tostring: any;
declare var __type: any;

module TS {

    export class NumberHelper {
        public static toString(this: number, ...params: any[]): string {
            return tostring(this);
        }
    }

    export class Number {
        public static MAX_VALUE = 1.7976931348623157e+308;
        public static MIN_VALUE = 5e-324;

        private __tostring: () => string;
        private __lt: (other: number) => boolean;
        private __le: (other: number) => boolean;

        public constructor(private constNumber: number) {
            this.__tostring = function (): string {
                return tostring(this.constNumber);
            };

            this.__lt = function (other: number | Number): boolean {
                return (__type(this) === 'number' ? this : this.constNumber)
                        <= (__type(other) === 'number' ? other : (<any>other).constNumber);
            };

            this.__le = function(other: number | Number): boolean {
                return (__type(this) === 'number' ? this : this.constNumber)
                        <= (__type(other) === 'number' ? other : (<any>other).constNumber);
            };

            this.__unm = function(): boolean {
                return !(__type(this) === 'number' ? this : this.constNumber);
            };

            this.__add = function(other: number | Number): boolean {
                return (__type(this) === 'number' ? this : this.constNumber)
                        + (__type(other) === 'number' ? other : (<any>other).constNumber);
            };

            this.__sub = function(other: number | Number): boolean {
                return (__type(this) === 'number' ? this : this.constNumber)
                        - (__type(other) === 'number' ? other : (<any>other).constNumber);
            };

            this.__mul = function(other: number | Number): boolean {
                return (__type(this) === 'number' ? this : this.constNumber)
                        * (__type(other) === 'number' ? other : (<any>other).constNumber);
            };

            this.__div = function(other: number | Number): boolean {
                return (__type(this) === 'number' ? this : this.constNumber)
                        / (__type(other) === 'number' ? other : (<any>other).constNumber);
            };
        }

        public toString(): String {
            // tslint:disable-next-line:no-construct
            return new String(tostring(this.constNumber));
        }
    }
}
