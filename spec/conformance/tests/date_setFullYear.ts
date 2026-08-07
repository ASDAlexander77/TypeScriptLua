//const event = new Date('August 19, 1975 23:15:30');
const event = new Date(177718530000);

event.setFullYear(1977);

console.log(event.getFullYear());
// Expected output: 1977

assert(event.getFullYear() == 1977)

event.setFullYear(0);

console.log(event.getFullYear());
// Expected output: 0

console.log("ALL DONE");
