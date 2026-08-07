const m = new Map();

m.set(1, "Hello");

console.log(m.has(1));
assert(m.has(1));

m.set(10.0, "Hello");

console.log(m.has(10.0));
assert(m.has(10.0));

m.set(true, "Hello");

console.log(m.has(true));
assert(m.has(true));

m.set("Hello", "Hello");

console.log(m.has("Hello"));
console.log(m.has("Hel" + "lo"));

assert(m.has("Hello"));
assert(m.has("Hel" + "lo"));

console.log("ALL DONE");
