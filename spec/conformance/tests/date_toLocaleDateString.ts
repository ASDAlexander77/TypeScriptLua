const event = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
/*
const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
*/

console.log(event.toLocaleDateString('de-DE'/*, options*/));
// Expected output (varies according to local timezone): Donnerstag, 20. Dezember 2012

console.log("ALL DONE");
