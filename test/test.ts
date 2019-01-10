import './JS';

const x = "Hello";

function to(p: any) {
    console.log(p);
    ((d) => {
        from(d);
    })(p);
}

function from(s: string) {
    console.log(s.substr(0));
}

to(x);
