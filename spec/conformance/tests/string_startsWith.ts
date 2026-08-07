const str1 = "Saturday night plans";

console.log(str1.startsWith("Sat"));
// Expected output: true

assert(str1.startsWith("Sat"));

console.log(str1.startsWith("Sat", 3));
// Expected output: false

assert(!str1.startsWith("Sat", 3));

console.log("ALL DONE");
