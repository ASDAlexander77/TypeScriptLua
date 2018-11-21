const p = print

function fnc(d) {
	const xx = 10;
    d[0] = 1;
    d[1] = 2;
    d["end"] = "hi";
}

p('start.');

const s = "Hello String";
const f = 3.14;
const i = 1;

const a = {};
if (a) {
    const b = {};
    a["object b"] = b;
    a["b"] = b;
    a[0] = b;
    a["value"] = 1;

    b[0] = 1;
    b[1] = 2;
    b["end"] = "hi";

    a["end"] = "end";

    fnc(a);
}

if (a) {
    const c = {};
}

p('done.');