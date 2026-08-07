const map1 = new Map<string, string>();
map1.set('bar', 'foo');

const result = map1.delete('bar');

console.log(result);
// Expected result: true
// True indicates successful removal

assert(result);

const exists = map1.has('bar');

console.log(exists);
// Expected result: false

assert(!exists);

console.log("ALL DONE");
