//const date1 = new Date('December 31, 1975, 23:15:30 GMT+11:00');
const date1 = new Date(189260130000);

console.log(date1.getUTCMinutes());
// Expected output: 15

date1.setUTCMinutes(25);

console.log(date1.getUTCMinutes());
// Expected output: 25

assert(date1.getUTCMinutes() == 25);

console.log("ALL DONE");
