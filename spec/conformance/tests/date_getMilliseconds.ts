//const moonLanding = new Date('July 20, 1979 00:20:18');
const moonLanding = new Date(301274418000);
moonLanding.setMilliseconds(123);

assert(moonLanding.getMilliseconds() == 123);

console.log(moonLanding.getMilliseconds());
// Expected output: 123

console.log("ALL DONE");
