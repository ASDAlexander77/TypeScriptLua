//const event = new Date('August 19, 1975 23:15:30');
const event = new Date(177718530000);

event.setMinutes(45);

console.log(event.getMinutes());
// Expected output: 45

assert(event.getMinutes() == 45);

console.log(event);
// Expected output: "Tue Aug 19 1975 23:45:30 GMT+0200 (CEST)"
// Note: your timezone may vary

console.log("ALL DONE");
