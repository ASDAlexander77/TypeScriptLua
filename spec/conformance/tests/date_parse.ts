const unixTimeZero = Date.parse("01 Jan 1970 00:00:00");
const javaScriptRelease = Date.parse("04 Dec 1995 00:12:00");

console.log(unixTimeZero);
// Expected output: 0

assert(unixTimeZero == 0);

console.log(javaScriptRelease);
// Expected output: 818035920000

assert(javaScriptRelease == 818035920000);

console.log("ALL DONE");
