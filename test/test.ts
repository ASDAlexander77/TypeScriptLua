__instanceof = function (inst: object, type: object) {
    if (inst === null) {
        return false;
    }

    let mt: object;
    switch (__type(inst)) {
        case "table":
            mt = rawget(inst, "__proto");
            break;
        case "number":
            mt = Number;
            break;
        case "string":
            mt = String;
            break;
        case "boolean":
            mt = Boolean;
            break;
    }

    while (mt !== null) {
        if (mt === type) {
            return true;
        }

        mt = rawget(mt, "__proto");
    }

    return false;
}

__get_call_undefined__ = function (t, k) {
    // root get for static methods
    let get_: object = rawget(t, "__get__");
    let getmethod: object = get_ && get_[k];
    if (getmethod !== null) {
        return getmethod(t);
    }

    let proto: object = rawget(t, "__proto");

    while (proto !== null) {
        let v = rawget(proto, k);
        if (v === null) {
            const nullsHolder: object = rawget(t, "__nulls");
            if (nullsHolder && nullsHolder[k]) {
                return null;
            }
        } else {
            return v;
        }

        get_ = rawget(proto, "__get__");
        getmethod = get_ && get_[k];
        if (getmethod !== null) {
            return getmethod(t);
        }

        proto = rawget(proto, "__proto");
    }

    return undefined;
}

__set_call_undefined__ = function (t, k, v) {
    let proto: object = t;
    while (proto !== null) {
        let set_: object = rawget(proto, "__set__");
        const setmethod: object = set_ && set_[k];
        if (setmethod !== null) {
            setmethod(t, v);
            return;
        }

        proto = rawget(proto, "__proto");
    }

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
}

import './JS';

var date = new Date();
