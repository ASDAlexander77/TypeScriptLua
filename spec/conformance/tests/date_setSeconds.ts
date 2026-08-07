//const event = new Date('August 19, 1975 23:15:30');
const event = new Date(177718530000);

event.setSeconds(42);

console.log(event.getSeconds());
// Expected output: 42

assert(event.getSeconds() == 42);

console.log(event);
// Expected output: "Sat Apr 19 1975 23:15:42 GMT+0100 (CET)"
// Note: your timezone may vary

console.log("ALL DONE");
