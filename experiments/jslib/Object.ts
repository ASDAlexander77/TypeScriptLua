declare function setmetatable(obj: any, meta: any): any;
declare var __get_call__: any;
declare var __set_call__: any;

module JS {

    export class Object {

        public create(proto: any): any {
            const obj = <any>{};
            obj.__index = __get_call__;
            obj.__proto = proto;
            obj.__newindex = __set_call__;
            setmetatable(obj, obj);
            return obj;
        }

        public freeze(obj: any) {
            obj.__newindex = function (table: any) {
                throw 'Object is read-only';
            };

            setmetatable(obj, obj);
        }
    }

}
