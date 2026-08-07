const evens = new Set([2, 4, 6, 8]);
const squares = new Set([1, 4, 9]);
console.log(evens.union(squares)); // Set(6) { 2, 4, 6, 8, 1, 9 }

assert(evens.union(squares).toString() == "Set(6) { 2, 4, 6, 8, 1, 9 }");

console.log("ALL DONE");
