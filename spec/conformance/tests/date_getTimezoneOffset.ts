//const date1 = new Date('August 19, 1975 23:15:30 GMT+07:00');
const date1 = new Date(177696930000);
//const date2 = new Date('August 19, 1975 23:15:30 GMT-02:00');
const date2 = new Date(177729330000);

console.log(date1.getTimezoneOffset());
// Expected output: your local timezone offset in minutes

console.log(date1.getTimezoneOffset() === date2.getTimezoneOffset());
// Expected output: true

console.log("ALL DONE");
