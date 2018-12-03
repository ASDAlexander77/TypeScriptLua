declare var string: any;

module JS {

    export class StringHelper {
        public static replace(constString: string, regExp: RegExp, func: (p: string) => string): string {
            return string.gsub(constString, regExp.__getLuaPattern(), func);
        }
    }

    export class String {
        public constructor(private constString: string) {
        }

        public replace(regExp: RegExp, func: (p: string) => string): String {
            // retuns constString
            return new String(StringHelper.replace(this.constString, regExp, func));
        }

        public toString(): String {
            return this;
        }

        public __tostring(): string {
            return this.constString;
        }
    }

}
