import './JS';

let a: string = "asd 1";

let b = { asd: a };

let c = b.asd.length;

console.log(c);

function f(d: any) {

	let e = d.asd.length;

	console.log(e);

}

f(b);
