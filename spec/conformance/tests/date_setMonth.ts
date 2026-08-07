//const event = new Date('August 19, 1975 23:15:30');
const event = new Date(177718530000);

event.setMonth(3);

console.log(event.getMonth());
// Expected output: 3

assert(event.getMonth() == 3);

console.log(event);
// Expected output: "Sat Apr 19 1975 23:15:30 GMT+0100 (CET)"
// Note: your timezone may vary

console.log("ALL DONE");
