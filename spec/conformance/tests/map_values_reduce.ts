const nameToDeposit = new Map<string, number>([
    ["Anne", 1000],
    ["Bert", 1500],
    ["Carl", 2000],
]);

const totalDeposit = [...nameToDeposit.values()].reduce((a, b) => a + b);

console.log(totalDeposit);

assert(totalDeposit == 4500)

console.log("ALL DONE");
