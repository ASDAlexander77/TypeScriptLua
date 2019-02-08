declare var string: any;

module JS {

    type FuncString = (p: string) => string;

    export class StringHelper {
        public static getLength(constString: string): number {
            return string.len(constString);
        }

        public static replace(constString: string, valOrRegExp: string | RegExp, valOfFunc: string | FuncString): string {
            if (typeof valOrRegExp == 'string') {
                return string.gsub(constString, valOrRegExp, valOfFunc);
            }

            return string.gsub(constString, (<RegExp>valOrRegExp).__getLuaPattern(), valOfFunc);
        }

        public static substr(constString: string, begin?: number, len?: number): string {
            return string.sub(constString, (begin || 0) + 1, (begin || 0) + (len || string.len(constString)) + 1);
        }

        public static substring(constString: string, begin?: number, end?: number): string {
            return string.sub(constString, (begin || 0) + 1, end ? end + 1 : null);
        }

        public static slice(constString: string, start?: number, end?: number): string {
            return string.sub(constString, start, end);
        }

        public static indexOf(constString: string, pattern: string, begin?: number): number {
            return (table.pack(string.find(constString, pattern, (begin || 0) + 1, true))[1] || 0) - 1;
        }

        public static search(constString: string, pattern: string | RegExp, begin?: number): number {
            if (typeof pattern == 'string') {
                table.pack(string.find(constString, pattern, (begin || 0) + 1, true))[1] || -1;
            }

            return table.pack(string.find(constString, (<RegExp>pattern).__getLuaPattern(), (begin || 0) + 1))[1] || -1;
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

                const part = StringHelper.substring(constString, current, position - 1);

                current = position + sizeSeparator;

                ArrayHelper.pushOne(result, part);
            }

            return result;
        }
    }

    export class String {
        private __tostring: () => string;
        private __concat: (_this: String | string, other: String | string) => string;
        private __index: (_this: String, indx: number) => any;

        public constructor(private constString: string) {
            this.__tostring = function (): string {
                return this.constString;
            };

            this.__concat = function (left: String | string, right: String | string) {
                return <string>(((<String>left).constString) || left) + <string>(((<String>right).constString) || right);
            };

            this.__index = function (_this: String, indx: number): any {
                // @ts-ignore
                if (typeof(indx) == 'number') {
                    // @ts-ignore
                    return _this.constString[indx];
                }

                // @ts-ignore
                return __get_call__(_this, indx);
            };
        }

        public replace(regExp: RegExp, func: (p: string) => string): String {
            // tslint:disable-next-line:no-construct
            return new String(StringHelper.replace(this.constString, regExp, func));
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
