declare function setmetatable(obj: any, meta: any): any;

class Object {
    public freeze(obj: any) {
        obj.__newindex = function (table: any) {
            throw 'Object is read-only';
        };

        setmetatable(obj, obj);
    }
}
