import './JS';

// tslint:disable-next-line:no-construct
const sc = new String('ABC');
console.log(sc);

const s = 'asd';

function f(p: any) {
    console.log(p.substr(0, 1));
}

f(s);
