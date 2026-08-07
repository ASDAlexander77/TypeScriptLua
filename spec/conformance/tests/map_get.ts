const map1 = new Map<string, string>();
map1.set('bar', 'foo');

console.log(map1.get('bar'));
// Expected output: "foo"

assert(map1.get('bar') == "foo");

// TODO:
//console.log(map1.get('baz'));
// Expected output: undefined

console.log("ALL DONE");
