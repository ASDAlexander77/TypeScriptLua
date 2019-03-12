declare function setmetatable(obj: any, meta: any): any;
declare var __get_call_undefined__: any;
declare var __set_call_undefined__: any;

module JS {

    export class Object {

        // to make dynamic object to convert string into 'new String' and number to 'new Number'
        constructor(private obj: object = {}) {
            // @ts-ignore
            this.__index = function (_this: object, indx: number | string): any {
                // @ts-ignore
                const val = _this.obj[indx];
                switch (typeof (val)) {
                    case 'number':
                        return new Number(val);
                    case 'string':
                        return new String(val);
                    case 'table':
                        return new Object(val);
                }

                return val;
            };

            // @ts-ignore
            this.__newindex = function (_this: object, indx: number | string, val: T): void {
                // @ts-ignore
                _this.obj[indx] = val;
            };
        }

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
                if (typeof (obj.__index) !== 'function') {
                    obj.__index = __get_call_undefined__;
                }
            }

            const setMethod = opts.set || ((opts.value && typeof(opts.value) === 'function') ? opts.value : null);
            if (setMethod) {
                if (!obj.__set__) {
                    obj.__set__ = {};
                    delete obj.__set__.__newindex;
                }

                obj.__set__[name] = setMethod;
                if (typeof (obj.__newindex) !== 'function') {
                    obj.__newindex = __set_call_undefined__;
                }
            }

            if (opts.value && typeof(opts.value) !== 'function') {
                obj[name] = opts.value;
            }
        }

        public static getOwnPropertyDescriptor(obj: any, name: string) {
            const opts = {};
            if (obj.__get__) {
                const getMethod = obj.__get__[name];
                if (typeof (getMethod) === 'function') {
                    // @ts-ignore
                    opts['get'] = getMethod;
                }
            }

            if (obj.__set__) {
                const setMethod = obj.__set__[name];
                if (typeof (setMethod) === 'function') {
                    // @ts-ignore
                    opts['set'] = setMethod;
                }
            }

            const value = obj[name];
            if (value) {
                // @ts-ignore
                opts['value'] = value;
            }

            return opts;
        }

        public static getPrototypeOf(obj: any): any {
            return obj.__proto;
        }
    }

}
