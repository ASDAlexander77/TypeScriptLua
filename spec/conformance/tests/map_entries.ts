const map1 = new Map();

map1.set('0', 'foo');
map1.set(1, 'bar');

for (const entry of map1.entries()) console.log(`entry: ${entry.key} = ${entry.value}`);

console.log("ALL DONE");
