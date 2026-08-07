const str = 'table football';

const regex = new RegExp('foo*');

console.log(regex.test(str));
// Expected output: true

assert(regex.test(str));

const regex2 = new RegExp('xxx');

console.log(regex2.test(str));
// Expected output: false

assert(!regex2.test(str));

console.log("ALL DONE");
