const str = "To be, or not to be, that is the question.";

console.log(str.startsWith("To be")); // true
console.log(str.startsWith("not to be")); // false
console.log(str.startsWith("not to be", 10)); // true

assert(str.startsWith("To be")); // true
assert(!str.startsWith("not to be")); // false
assert(str.startsWith("not to be", 10)); // true

console.log("ALL DONE");
