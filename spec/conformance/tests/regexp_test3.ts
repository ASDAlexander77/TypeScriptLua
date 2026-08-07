const regex = /foo/g; // the "global" flag is set
console.log(regex.lastIndex);

// regex.lastIndex is at 0
assert(regex.test("foo")); // true
console.log(regex.lastIndex);

// regex.lastIndex is now at 3
assert(!regex.test("foo")); // false
console.log(regex.lastIndex);

// regex.lastIndex is at 0
assert(regex.test("barfoo")); // true
console.log(regex.lastIndex);

// regex.lastIndex is at 6
assert(!regex.test("foobar")); // false
console.log(regex.lastIndex);

// regex.lastIndex is at 0
assert(regex.test("foobarfoo")); // true
console.log(regex.lastIndex);

// regex.lastIndex is at 3
assert(regex.test("foobarfoo")); // true
console.log(regex.lastIndex);

// regex.lastIndex is at 9
assert(!regex.test("foobarfoo")); // false
console.log(regex.lastIndex);

console.log("ALL DONE");
