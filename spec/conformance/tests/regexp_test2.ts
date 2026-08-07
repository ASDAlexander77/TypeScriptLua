const regex1 = new RegExp('^football');
const regex2 = new RegExp('^football', 'm');

console.log(regex1.multiline);
// Expected output: false

assert(!regex1.multiline);

console.log(regex2.multiline);
// Expected output: true

assert(regex2.multiline);

console.log(regex1.test('rugby\nfootball'));
// Expected output: false

// TODO: finish multiline expr
//assert(!regex1.test('rugby\nfootball'));

console.log(regex2.test('rugby\nfootball'));
// Expected output: true

assert(regex2.test('rugby\nfootball'));

console.log("ALL DONE");
