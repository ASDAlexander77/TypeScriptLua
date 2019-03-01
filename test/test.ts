import './JS';

const val1 = JSON.parse('1');
console.log(val1);

const val2 = JSON.parse('10.123');
console.log(val2);

const val3 = JSON.parse('1e-2');
console.log(val3);

const valb1 = JSON.parse('true');
console.log(valb1);

const valb2 = JSON.parse('false');
console.log(valb2);

const vals = JSON.parse('"string value"');
console.log(vals);

const vala = JSON.parse('[ 1, 2, 3 ]');
console.log(vala);

const valo = JSON.parse('{ "val1": 1, "val2": "asd1" }');
console.log(valo);
