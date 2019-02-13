import './JS';

const a = new Array<any>();

a.push(null);
a.push(null);
a.push(10);

console.log(a.length);
console.log(<any>(a[0]));
console.log(<any>(a[1]));
console.log(<any>(a[2]));


const s = new String("asd");
console.log(<any>(s[0]));
console.log(<any>(s[1]));
console.log(<any>(s[2]));
