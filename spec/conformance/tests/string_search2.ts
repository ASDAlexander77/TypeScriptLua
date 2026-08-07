const str = "hey JudE";
const re = /[A-Z]/;
const reDot = /[.]/;
assert(str.search(re) == 4); // returns 4, which is the index of the first capital letter "J"
assert(str.search(reDot) == -1); // returns -1 cannot find '.' dot punctuation

console.log("ALL DONE");
