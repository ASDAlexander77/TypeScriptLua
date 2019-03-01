import './JS';

const a = {
    b: 10,
    c: function (p1) {
        console.log('value: ');
        console.log(this.b);
        console.log(p1);
    }
};

a.c(12);

const b = <any>{};
b.b = 100;
b.c = a.c;
b.c(13);

