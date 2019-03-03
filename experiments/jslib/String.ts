declare var string: any;
declare var table: any;

module JS {

    type FuncString = (p: string) => string;

    export class StringHelper {
        public static getLength(this: string): number {
            return string.len(this);
        }

        public static fromCharCode(code: string | number): string {
            return string.char(tonumber(code));
        }

        public static charCodeAt(this: string, index: number): number {
            return string.byte(this, index + 1);
        }

        public static replace(this: string, valOrRegExp: string | RegExp, valOrFunc: string | FuncString): string {
            if (typeof valOrRegExp === 'string') {
                return string.gsub(this, string.gsub(valOrRegExp, '[%^%$%(%)%%%.%[%]%*%+%-%?]', '%%%1'), valOrFunc);
            }

            if ((<any>valOrRegExp).nativeHandle) {
                let current = 0;
                const size = this.getLength();

                const isFunc = typeof valOrFunc === 'function';

                const result = new Array<string>();

                while (current < size) {
                    const matchResult = (<RegExp>valOrRegExp).exec(this);
                    const position = matchResult ? matchResult.index : -1;
                    if (position < 0) {
                        const rest = this.substring(current);
                        ArrayHelper.pushOne(result, rest);
                        return result.join();
                    }

                    if (position > current) {
                        const part = this.substring(current, position);
                        ArrayHelper.pushOne(result, part);
                    }

                    current = position + matchResult[0].length;

                    if (!isFunc) {
                        ArrayHelper.pushOne(result, valOrFunc);
                    } else {
                        const val = valOrFunc(matchResult[0], table.unpack(matchResult));
                        ArrayHelper.pushOne(result, val);
                    }
                }

                return result.join();
            }

            return string.gsub(this, (<any>valOrRegExp).__getLuaPattern(), valOrFunc);
        }

        public static substr(this: string, begin?: number, len?: number): string {
            return string.sub(this, (begin || 0) + 1, (begin || 0) + (len || string.len(this)));
        }

        public static substring(this: string, begin?: number, end?: number): string {
            if (begin == end && end == null || begin === end) {
                return '';
            }

            return string.sub(this, (begin || 0) + 1, end != undefined ? end : null);
        }

        public static slice(this: string, start?: number, end?: number): string {
            return string.sub(this, (start || 0) + 1, end != undefined ? end : null);
        }

        public static indexOf(this: string, pattern: string, begin?: number): number {
            return (table.pack(string.find(this, pattern, (begin || 0) + 1, true))[1] || 0) - 1;
        }

        public static lastIndexOf(this: string, pattern: string, begin?: number): number {
            let lastFound: number;
            let found: number;
            do {
                // @ts-ignore
                lastFound = found;
                found = table.pack(string.find(this, pattern, (begin || found || 0) + 1, true))[1];
            } while (found);

            return lastFound ? lastFound - 1 : -1;
        }

        public static search(this: string, pattern: string | RegExp, begin?: number): number {
            if (typeof pattern === 'string') {
                table.pack(string.find(this, pattern, (begin || 0) + 1, true))[1] || -1;
            }

            return table.pack(string.find(this, (<any>pattern).__getLuaPattern(), (begin || 0) + 1))[1] || -1;
        }

        public static toLowerCase(this: string): string {
            return string.lower(this);
        }

        public static toUpperCase(this: string): string {
            return string.upper(this);
        }

        public static split(this: string, separator: string): Array<string> {
            let current = 0;
            const size = this.getLength();
            const sizeSeparator = separator.getLength();

            const result = new Array<string>();

            while (current < size) {
                const position = this.indexOf(separator, current);
                if (position < 0) {
                    const rest = this.substring(current);
                    ArrayHelper.pushOne(result, rest);
                    return result;
                }

                const part = this.substring(current, position);

                current = position + sizeSeparator;

                ArrayHelper.pushOne(result, part);
            }

            return result;
        }
    }

    export class String {

        public constructor(private constString: string) {
            // @ts-ignore
            this.__tostring = function (): string {
                return this.constString;
            };

            // @ts-ignore
            this.__concat = function (left: String | string, right: String | string) {
                return <string>(((<String>left).constString) || left) + <string>(((<String>right).constString) || right);
            };

            // @ts-ignore
            this.__index = function (_this: String, indx: number | string): any {
                // @ts-ignore
                if (typeof(indx) === 'number') {
                    // @ts-ignore
                    return _this.constString[indx];
                }

                // @ts-ignore
                return __get_call_undefined__(_this, indx);
            };
        }

        public replace(valOrRegExp: string | RegExp, valOrFunc: string | FuncString): String {
            // tslint:disable-next-line:no-construct
            return new String(this.constString.replace(valOrRegExp, valOrFunc));
        }

        public charCodeAt(index: number): number {
            return this.constString.charCodeAt(index);
        }

        public substr(begin?: number, len?: number): String {
            // tslint:disable-next-line:no-construct
            return new String(this.constString.substr(begin, len));
        }

        public substring(begin?: number, end?: number): String {
            // tslint:disable-next-line:no-construct
            return new String(this.constString.substring(begin, end));
        }

        public indexOf(pattern: string, begin?: number): number {
            return this.constString.indexOf(pattern, begin);
        }

        public split(separator: string): Array<string> {
            return this.constString.split(separator);
        }

        public slice(start?: number, end?: number): String {
            // tslint:disable-next-line:no-construct
            return new String(this.constString.substring(start, end));
        }

        public toLowerCase(): String {
            // tslint:disable-next-line:no-construct
            return new String(this.constString.toLowerCase());
        }

        public toUpperCase(): String {
            // tslint:disable-next-line:no-construct
            return new String(this.constString.toUpperCase());
        }

        public get length(): number {
            return string.len(this.constString);
        }

        public toString(): String {
            return this;
        }
    }

}
