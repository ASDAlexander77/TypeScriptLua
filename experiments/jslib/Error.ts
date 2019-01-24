declare var string: any;

module JS {

    export class Error {
        private __tostring: () => string;

        public constructor(private message: string) {
            this.__tostring = function (): string {
                return this.message;
            };
        }

        public toString(): String {
            // tslint:disable-next-line:no-construct
            return new String(this.message);
        }
    }

}
