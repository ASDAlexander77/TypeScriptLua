declare var string: any;

module JS {

    export class StringHelper {
        public static replace(constString: string, regExp: RegExp, func: (p: string) => string): string {
            return string.gsub(constString, regExp.__getLuaPattern(), func);
        }

        public static substr(constString: string, begin?: number, len?: number): string {
            return string.sub(constString, (begin || 0) + 1, (begin || 0) + (len || string.len(constString)) + 1);
        }

        public static substring(constString: string, begin?: number, end?: number): string {
            return string.sub(constString, (begin || 0) + 1, (end || 0) + 1);
        }

        public static indexOf(constString: string, pattern: string, begin?: number): number {
            return table.pack(string.find(constString, pattern, (begin || 0) + 1))[1] || -1;
        }
    }

    export class String {
        private __tostring: () => string;
        private __concat: (_this: String | string, other: String | string) => string;

        public constructor(private constString: string) {
            this.__tostring = function (): string {
                return this.constString;
            };

            this.__concat = function (left: String | string, right: String | string) {
                return <string>(((<String>left).constString) || left) + <string>(((<String>right).constString) || right);
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
            return new String(StringHelper.substr(this.constString, begin, end));
        }

        public indexOf(pattern: string, begin?: number): number {
            return StringHelper.indexOf(this.constString, pattern, begin);
        }

        public toString(): String {
            return this;
        }
    }

}
