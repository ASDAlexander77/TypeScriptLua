module JS {

    // tslint:disable-next-line:class-name
    export class undefined {
        public static __tostring(): string {
            return 'undefined';
        }
    }

    setmetatable(undefined, undefined);
}
