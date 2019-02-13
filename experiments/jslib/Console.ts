declare var print: any;
declare var io: any;

module JS {

    export class Console {

        public static log(...params: any[]) {
            print(...params);
        }

        public static error(...params: any[]) {
            io.stderr.write(tostring(params[0]));
        }
    }

}

declare var console: any;
console = JS.Console;
