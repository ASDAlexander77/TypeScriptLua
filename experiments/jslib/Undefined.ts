module JS {

    // tslint:disable-next-line:class-name
    export class __undefined {

        // @ts-ignore
        public static name = 'undefined';

        public static __tostring(): string {
            return __undefined.name;
        }
    }

    setmetatable(__undefined, __undefined);
}
