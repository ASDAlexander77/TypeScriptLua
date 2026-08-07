//const moonLanding = new Date('July 20, 1979 00:20:18');
const moonLanding = new Date(301274418000);

assert(moonLanding.getMonth() == 6);

console.log(moonLanding.getMonth()); // (January gives 0)
// Expected output: 6

console.log("ALL DONE");
