import './JS';

function generateExpandMember(setCallback: string, targetKey: string) {
    return (target: any, propertyKey: string) => {
        var key = targetKey || ("_" + propertyKey);
        Object.defineProperty(target, propertyKey, {
            get: function(this: any) {
                return this[key];
            },
            set: function(this: any, value) {
                if (this[key] === value) {
                    return;
                }
                this[key] = value;

                target[setCallback].apply(this);
            },
            enumerable: true,
            configurable: true
        });
    };
}
