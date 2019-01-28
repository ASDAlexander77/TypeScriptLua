declare var print: any;
declare var error: any;

module JS {

    export class Console {

        public static log(...params: any[]) {
            print(...params);
        }

        public static error(...params: any[]) {
            error(...params);
        }
    }

}

declare var console: any;
console = JS.Console;
