//const event = new Date('December 31, 1975 23:15:30 GMT-3:00');
const event = new Date(189310530000);

console.log(event.getUTCFullYear());
// Expected output: 1976

console.log(event.toUTCString());
// Expected output: "Thu, 01 Jan 1976 02:15:30 GMT"

event.setUTCFullYear(1975);

console.log(event.toUTCString());
// Expected output: "Wed, 01 Jan 1975 02:15:30 GMT"

assert(event.getUTCFullYear() == 1975);

console.log("ALL DONE");
