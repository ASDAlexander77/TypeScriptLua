const map1 = new Map();

map1.set('0', 'foo');
map1.set(1, 'bar');

for (const key of map1.keys())
    console.log(key);

// Expected output: "0"
// Expected output: 1

console.log("ALL DONE");
