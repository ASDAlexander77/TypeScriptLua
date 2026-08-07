const map1 = new Map<string, string>();
map1.set('bar', 'foo');

console.log(map1.has('bar'));
// Expected output: true

assert(map1.has('bar'));

console.log(map1.has('baz'));
// Expected output: false

assert(!map1.has('baz'));

console.log("ALL DONE");
