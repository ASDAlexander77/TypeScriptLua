const g__rawget: any = rawget;
const g__rawset: any = rawset;
const g__undefined: any = undefined;
__get_undefined__ = function (t, k) {
    const values: object = g__rawget(t, "_UP_ENV");
    if (values !== null) {
        return values[k];
    }

    const nullsHolder: object = g__rawget(t, "__nulls");
    if (nullsHolder && nullsHolder[k]) {
        return null;
    }

    return g__undefined;
};

__set_undefined__ = function (t, k, v) {
    if (v === null) {
        const nullsHolder: object = g__rawget(t, "__nulls");
        if (nullsHolder === null) {
            nullsHolder = {};
            g__.rawset(t, "__nulls", nullsHolder);
        }

        nullsHolder[k] = true;
        return;
    }

    let v0 = v;
    if (v === g__undefined) {
        const nullsHolder: object = g__rawget(t, "__nulls");
        if (nullsHolder !== null) {
            nullsHolder[k] = null;
        }

        v0 = null;
    }

    g__rawset(t, k, v0);
};

//import './JS';

function f() {
    var a = 10;
    return function g() {
        var b = a + 1;
        return b;
    }
}

var g = f();
print(g());
