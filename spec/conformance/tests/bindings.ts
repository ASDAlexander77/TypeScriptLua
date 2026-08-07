const [a, b, c, d] = new Set(["a", "b", "c"]);
console.log(a, b, c, d); // "a", "b", "c", undefined

assert(a == "a");
assert(d == undefined);

const [a2, b2, c2, d2] = "abc";
console.log(a2, b2, c2, d2); // "a", "b", "c", undefined

assert(<string>a2 == "a");
assert(d2 == undefined);

console.log("ALL DONE");