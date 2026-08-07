//const date1 = new Date('December 31, 1975, 23:15:30 GMT+11:00');
const date1 = new Date(189260130000);

console.log(date1.getUTCSeconds());
// Expected output: 30

date1.setUTCSeconds(39);

console.log(date1.getUTCSeconds());
// Expected output: 39

assert(date1.getUTCSeconds() == 39);

console.log("ALL DONE");
