//const event = new Date('05 October 2011 14:48 UTC');
const event = new Date(1317826080000);

console.log(event.toString());
// Expected output: "Wed Oct 05 2011 16:48:00 GMT+0200 (CEST)"
// Note: your timezone may vary

event.setMilliseconds(123);

console.log(event.toISOString());
// Expected output: "2011-10-05T14:48:00.123Z"

assert(event.toISOString() == "2011-10-05T14:48:00.123Z")

console.log("ALL DONE");
