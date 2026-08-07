const regexp = /t(e)(st(\d?))/g;
const str = 'test1test2';

const array = [...str.matchAll(regexp)];

console.log(array[0]);
// Expected output: Array ["test1", "e", "st1", "1"]

assert(<string>array[0] == "test1,e,st1,1");

console.log(array[1]);
// Expected output: Array ["test2", "e", "st2", "2"]

assert(<string>array[1] == "test2,e,st2,2");

console.log("ALL DONE");
