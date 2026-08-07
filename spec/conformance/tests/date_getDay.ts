//const birthday = new Date('August 19, 1975 23:15:30');
const birthday = new Date(177718530000);
const day1 = birthday.getDay();
// Sunday - Saturday : 0 - 6

assert(day1 == 2);

console.log(day1);
// Expected output: 2

console.log("ALL DONE");
