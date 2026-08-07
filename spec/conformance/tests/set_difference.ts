const odds = new Set([1, 3, 5, 7, 9]);
const squares = new Set([1, 4, 9]);
console.log(odds.difference(squares)); // Set(3) { 3, 5, 7 }

assert(odds.difference(squares).toString() == "Set(3) { 3, 5, 7 }");

console.log("ALL DONE");
