//const event = new Date('August 19, 1975 23:15:30 GMT-3:00');
const event = new Date(177732930000);

console.log(event.getUTCDate());
// Expected output: 20

assert(event.getUTCDate() == 20);

event.setUTCDate(19);

console.log(event.getUTCDate());
// Expected output: 19

assert(event.getUTCDate() == 19);

console.log("ALL DONE");
