//const date1 = new Date('2018-01-24T12:38:29.069Z');
const date1 = new Date(1516797509069);

console.log(date1.getUTCMilliseconds());
// Expected output: 69

date1.setUTCMilliseconds(420);

console.log(date1.getUTCMilliseconds());
// Expected output: 420

assert(date1.getUTCMilliseconds() == 420);

console.log("ALL DONE");
