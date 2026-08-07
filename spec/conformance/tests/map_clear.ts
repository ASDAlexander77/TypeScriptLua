const map1 = new Map();

map1.set('bar', 'baz');
map1.set(1, 'foo');

console.log(map1.size);
// Expected output: 2

assert(map1.size == 2);

map1.forEach((v, k, inst) => console.log(`entry: ${k} = ${v}`));

map1.clear();

console.log(map1.size);
// Expected output: 0

assert(map1.size == 0);

console.log("ALL DONE");
