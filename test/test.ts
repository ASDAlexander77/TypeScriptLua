import './JS';

for (const s of new String("asd")) {
    console.log(<any>s);
}

for (const s of "jkl") {
    console.log(<any>s);
}

for (const a of ["b", "c", "d"]) {
    console.log(<any>a);
}
