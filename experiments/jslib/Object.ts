declare function setmetatable(obj: any, meta: any): any;
declare var __get_call__: any;
declare var __set_call__: any;

module JS {

    export class Object {

        public static create(proto: any): any {
            if (!proto) {
                throw new Error('Prototype can\'t be undefined or null');
            }

            const obj = <any>{};
            obj.__index = __get_call__;
            obj.__proto = proto;
            obj.__newindex = __set_call__;
            setmetatable(obj, obj);
            return obj;
        }

        public static freeze(obj: any) {
            obj.__newindex = function (table: any) {
                throw new Error('Object is read-only');
            };

            setmetatable(obj, obj);
        }

        public static keys(obj: any): Array<any> {
            const a = new Array<any>();
            let current = obj;
            while (current) {
                // tslint:disable-next-line:forin
                for (const k in current) {
                    a.push(k);
                }

                current = current.__proto;
            }

            return a;
        }

    }

}
