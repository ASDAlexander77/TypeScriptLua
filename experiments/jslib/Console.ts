declare var print: any;

module JS {

    export class Console {

        public log(...params: any[]) {
            print(params);
        }

    }

}

declare var console: any;
console = JS.Console;
