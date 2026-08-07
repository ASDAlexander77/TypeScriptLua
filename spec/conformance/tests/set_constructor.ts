const set1 = new Set([1, 2, 3, 4, 5]);

console.log(set1.has(1));
// Expected output: true

assert(set1.has(1));

console.log(set1.has(5));
// Expected output: true

assert(set1.has(5));

console.log(set1.has(6));
// Expected output: false

assert(!set1.has(6));

console.log("ALL DONE");
