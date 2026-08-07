declare var math: any;
declare var tonumber: any;

// @ts-ignore
Infinity = tonumber("1e+1000");

// dummy function
function decodeURIComponent(s: string) {
    return s;
}

// JS converts the argument with ToString before parsing, so 'parseInt(new String("4"))' is
// 4. 'tonumber' only understands lua numbers and strings and answers nil for a table, which
// made every String object parse as NaN. That is not a corner case: the emitter wraps string
// values in String objects, so 'parseInt(someString)' hits it - it silently emptied
// BabylonJS's indexed shader includes ('#include<lightFragment>[0..maxSimultaneousLights]'
// expands via 'parseInt' on its bounds), leaving meshes unlit and black.
function toPrimitiveForParse(v: any): any {
    return typeof v === 'object' ? tostring(v) : v;
}

// the return type is load-bearing: left off, it infers 'any', and every caller's result
// becomes 'any' too. The preprocessor only rewrites 'x.toString()' into
// 'NumberHelper.toString(x)' when it can see x is statically a number, so an 'any' turns it
// into a method call on a lua number - 'attempt to index a number value'
function parseInt(v: any): number {
    if (v == undefined) {
        return 0 / 0;
    }

    const num = tonumber(toPrimitiveForParse(v));
    if (num === null) {
        return 0 / 0;
    }

    return math.floor(num);
}

function parseFloat(v: any): number {
    if (v == undefined) {
        return 0 / 0;
    }

    const num = tonumber(toPrimitiveForParse(v));
    if (num === null) {
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
