declare var string: any;
declare var debug: any;

module JS {

    export class Error {
        private __tostring: () => string;
        private stack: string;

        public constructor(private message: string) {
            this.__tostring = function (): string {
                return this.message + '\n' + this.stack;
            };

            this.stack = debug.traceback();
        }

        public toString(): String {
            // tslint:disable-next-line:no-construct
            return new String(this.message);
        }
    }

}
