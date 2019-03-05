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
                    if (typeof val === 'function') {
                        continue;
                    }

                    a.push(k);
                }

                current = current.__proto;
            }

            // @ts-ignore
            return a;
        }

        public static defineProperty(obj: any, name: string, opts: any) {
            if (opts.get !== null) {
                if (!obj.__get__) {
                    obj.__get__ = {};
                    delete obj.__get__.__index;
                }

                obj.__get__[name] = opts.get;
                if (typeof(obj.__index) !== 'function') {
                    obj.__index = __get_call_undefined__;
                }
            }

            if (opts.set !== null) {
                if (!obj.__set__) {
                    obj.__set__ = {};
                    delete obj.__set__.__newindex;
                }

                obj.__set__[name] = opts.set;
                if (typeof(obj.__newindex) !== 'function') {
                    obj.__newindex = __set_call_undefined__;
                }
            }
        }

        public static getPrototypeOf(obj: any): any {
            return obj.__proto;
        }
    }

}
