declare var math: any;
declare var tonumber: any;

// dummy function
function decodeURIComponent(s: string) {
    return s;
}

function parseInt(v: any) {
    if (!v) {
        return 0 / 0;
    }

    const num = tonumber(v);
    if (!num) {
        return 0 / 0;
    }

    return math.floor(num);
}

function parseFloat(v: any) {
    if (!v) {
        return 0 / 0;
    }

    const num = tonumber(v);
    if (!num) {
        return 0 / 0;
    }

    return num;
}

function isNaN(v: any) {
    return tostring(v) == tostring(0 / 0);
}

function isFinite(v: any) {
    return tostring(v) == tostring(1 / 0);
}
