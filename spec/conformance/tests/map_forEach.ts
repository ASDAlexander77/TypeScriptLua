new Map([
    ['foo', 3],
    ['bar', "test"],
    ['baz', ""],
]).forEach((value, key, map) => console.log(`m[${key}] = ${value}`));

// Expected output: "m[foo] = 3"
// Expected output: "m[bar] = [object Object]"
// Expected output: "m[baz] = undefined"

console.log("ALL DONE");
