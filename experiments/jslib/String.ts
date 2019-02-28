declare var string: any;
declare var table: any;

module JS {

    type FuncString = (p: string) => string;

    export class StringHelper {
        public static getLength(constString: string): number {
            return string.len(constString);
        }

        public static replace(constString: string, valOrRegExp: string | RegExp, valOrFunc: string | FuncString): string {
            if (typeof valOrRegExp === 'string') {
                return string.gsub(constString, string.gsub(valOrRegExp, '[%^%$%(%)%%%.%[%]%*%+%-%?]', '%%%1'), valOrFunc);
            }

            if ((<any>valOrRegExp).nativeHandle) {
                let current = 0;
                const size = StringHelper.getLength(constString);

                const isFunc = typeof valOrFunc === 'function';

                const result = new Array<string>();

                while (current < size) {
                    const matchResult = (<RegExp>valOrRegExp).exec(constString);
                    const position = matchResult ? matchResult.index : -1;
                    if (position < 0) {
                        const rest = StringHelper.substring(constString, current);
                        ArrayHelper.pushOne(result, rest);
                        return result.join();
                    }

                    if (position > current) {
                        const part = StringHelper.substring(constString, current, position);
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

            return string.gsub(constString, (<any>valOrRegExp).__getLuaPattern(), valOrFunc);
        }

        public static substr(constString: string, begin?: number, len?: number): string {
            return string.sub(constString, (begin || 0) + 1, (begin || 0) + (len || string.len(constString)));
        }

        public static substring(constString: string, begin?: number, end?: number): string {
            if (begin == end && end == null || begin === end) {
                return '';
            }

            return string.sub(constString, (begin || 0) + 1, end != undefined ? end : null);
        }

        public static slice(constString: string, start?: number, end?: number): string {
            return string.sub(constString, (start || 0) + 1, end != undefined ? end : null);
        }

        public static indexOf(constString: string, pattern: string, begin?: number): number {
            return (table.pack(string.find(constString, pattern, (begin || 0) + 1, true))[1] || 0) - 1;
        }

        public static lastIndexOf(constString: string, pattern: string, begin?: number): number {
            let lastFound: number;
            let found: number;
            do {
                // @ts-ignore
                lastFound = found;
                found = table.pack(string.find(constString, pattern, (begin || found || 0) + 1, true))[1];
            } while (found);

            return lastFound ? lastFound - 1 : -1;
        }

        public static search(constString: string, pattern: string | RegExp, begin?: number): number {
            if (typeof pattern === 'string') {
                table.pack(string.find(constString, pattern, (begin || 0) + 1, true))[1] || -1;
            }

            return table.pack(string.find(constString, (<any>pattern).__getLuaPattern(), (begin || 0) + 1))[1] || -1;
        }

        public static toLowerCase(constString: string): string {
            return string.lower(constString);
        }

        public static toUpperCase(constString: string): string {
            return string.upper(constString);
        }

        public static split(constString: string, separator: string): Array<string> {
            let current = 0;
            const size = StringHelper.getLength(constString);
            const sizeSeparator = StringHelper.getLength(separator);

            const result = new Array<string>();

            while (current < size) {
                const position = StringHelper.indexOf(constString, separator, current);
                if (position < 0) {
                    const rest = StringHelper.substring(constString, current);
                    ArrayHelper.pushOne(result, rest);
                    return result;
                }

                const part = StringHelper.substring(constString, current, position);

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
            return new String(StringHelper.replace(this.constString, valOrRegExp, valOrFunc));
        }

        public substr(begin?: number, len?: number): String {
            // tslint:disable-next-line:no-construct
            return new String(StringHelper.substr(this.constString, begin, len));
        }

        public substring(begin?: number, end?: number): String {
            // tslint:disable-next-line:no-construct
            return new String(StringHelper.substring(this.constString, begin, end));
        }

        public indexOf(pattern: string, begin?: number): number {
            return StringHelper.indexOf(this.constString, pattern, begin);
        }

        public split(separator: string): Array<string> {
            return StringHelper.split(this.constString, separator);
        }

        public slice(start?: number, end?: number): String {
            // tslint:disable-next-line:no-construct
            return new String(StringHelper.substring(this.constString, start, end));
        }

        public toLowerCase(): String {
            // tslint:disable-next-line:no-construct
            return new String(StringHelper.toLowerCase(this.constString));
        }

        public toUpperCase(): String {
            // tslint:disable-next-line:no-construct
            return new String(StringHelper.toUpperCase(this.constString));
        }

        public get length(): number {
            return string.len(this.constString);
        }

        public toString(): String {
            return this;
        }
    }

}
