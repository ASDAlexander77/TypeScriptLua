// Depending on timezone, your results will vary
//const event = new Date('August 19, 1975 23:15:30 GMT+00:00');
const event = new Date(177722130000);

console.log(event.toLocaleTimeString('en-US'));
// Expected output: "1:15:30 AM"

console.log(event.toLocaleTimeString('it-IT'));
// Expected output: "01:15:30"

console.log(event.toLocaleTimeString('ar-EG'));
// Expected output: "١٢:١٥:٣٠ ص"

console.log("ALL DONE");
