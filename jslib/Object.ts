declare function setmetadata(obj: any, meta: any): any;

class Object {
    public freeze(obj: any) {
        obj.__newindex = function (table: any) {
            throw 'Object is read-only';
        };

        setmetadata(obj, obj);
    }
}
