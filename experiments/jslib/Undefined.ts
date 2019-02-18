module JS {

    // tslint:disable-next-line:class-name
    export class undefined {

        // @ts-ignore
        public static name = 'undefined';

        public static __tostring(): string {
            throw new Error('Object is possibly \'undefined\'');
        }

        public static __index(_this: any, indx: number | string): any {
            throw new Error('Object is possibly \'undefined\'');
        }

        public static __newindex(_this: any, indx: number | string, val: any): void {
            throw new Error('Object is possibly \'undefined\'');
        }

        public static __call(_this: any, indx: string): any {
            throw new Error('Object is possibly \'undefined\'');
        }

        public static __len(_this: any): number {
            throw new Error('Object is possibly \'undefined\'');
        }
    }

    setmetatable(undefined, undefined);
}
