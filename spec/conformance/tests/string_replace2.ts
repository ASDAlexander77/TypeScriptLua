const re = /(\w+)\s(\w+)/;
const str = "Maria Cruz";
const newstr = str.replace(re, "$2, $1");
console.log(newstr); // Cruz, Maria

assert(newstr == "Cruz, Maria");

console.log("ALL DONE");
