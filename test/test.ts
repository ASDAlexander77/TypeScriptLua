__get_undefined__ = function (t, k) {
    const values: object = rawget(t, "__super");
    if (values !== null) {
        return values[k];
    }

    const nullsHolder: object = rawget(t, "__nulls");
    if (nullsHolder && nullsHolder[k]) {
        return null;
    }

    return undefined;
};

__set_undefined__ = function (t, k, v) {
    if (v === null) {
        const nullsHolder: object = rawget(t, "__nulls");
        if (nullsHolder === null) {
            nullsHolder = {};
            rawset(t, "__nulls", nullsHolder);
        }

        nullsHolder[k] = true;
        return;
    }

    let v0 = v;
    if (v === undefined) {
        const nullsHolder: object = rawget(t, "__nulls");
        if (nullsHolder !== null) {
            nullsHolder[k] = null;
        }

        v0 = null;
    }

    rawset(t, k, v0);
};

import './JS';

function f() {
    var a = 10;
    return function g() {
        var b = a + 1;
        return b;
    }
}

var g = f();
console.log(g());
