import './JS';

const a = [1, "2", "3"];

console.log(a.join());

console.log(a.map(function (v: any): string {
    return v + "_";
}));

console.log(a);

for (const i of a) {
    console.log(i);
}
