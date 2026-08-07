//const event = new Date('August 19, 1975 00:00:00');
const event = new Date(177634800000);

event.setDate(24);

console.log(event.getDate());
// Expected output: 24

assert(event.getDate() == 24)

event.setDate(32);
// Only 31 days in August!

console.log(event.getDate());
// Expected output: 1

assert(event.getDate() == 1)

console.log("ALL DONE");
