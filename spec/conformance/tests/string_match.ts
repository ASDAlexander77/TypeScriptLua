const paragraph = 'The quick brown fox jumps over the lazy dog. It barked.';
const regex = /[A-Z]/g;
const found = paragraph.match(regex);

assert(found.length == 2);
assert(<string>found == "T,I");

console.log(found);
// Expected output: Array ["T", "I"]   

console.log("ALL DONE");
