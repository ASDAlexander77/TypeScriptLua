declare function setmetatable(obj: any, meta: any): any;
declare var __get_call_undefined__: any;
declare var __set_call_undefined__: any;

module JS {

    export class Object {

        public static create(proto: any): any {
            if (!proto) {
                throw new Error('Prototype can\'t be undefined or null');
            }

            const obj = <any>{};
            obj.__index = __get_call_undefined__;
            obj.__proto = proto;
            obj.__newindex = __set_call_undefined__;
            setmetatable(obj, obj);

            if (obj.constructor) {
                obj.constructor();
            }

            return obj;
        }

        public static freeze(obj: any) {
            obj.__newindex = function (table: any) {
                throw new Error('Object is read-only');
            };

            setmetatable(obj, obj);
        }

        public static keys(obj: any): string[] {
            const a = new Array<string>();
            let current = obj;
            if (current) {
                // tslint:disable-next-line:forin
                for (const k in current) {
                    // tslint:disable-next-line:no-construct
                    a.push(k);
                }

                current = current.__proto;
            }

            while (current) {
                // tslint:disable-next-line:forin
                for (const k in current) {
                    const val = current[k];
                    if (typeof val == 'function') {
                        continue;
                    }

                    a.push(k);
                }

                current = current.__proto;
            }

            // @ts-ignore
            return a;
        }

    }

}
