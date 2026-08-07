const map1 = new Map();

map1.set('0', 'foo');
map1.set(1, 'bar');

const iterator1 = map1.values();

for (const v of iterator1)
    console.log(v);

// Expected output: "foo"
// Expected output: "bar"

console.log("ALL DONE");
