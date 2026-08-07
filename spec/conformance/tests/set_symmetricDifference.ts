const evens = new Set([2, 4, 6, 8]);
const squares = new Set([1, 4, 9]);
console.log(evens.symmetricDifference(squares)); // Set(5) { 2, 6, 8, 1, 9 }

assert(evens.symmetricDifference(squares).toString() == "Set(5) { 2, 6, 8, 1, 9 }");

console.log("ALL DONE");
