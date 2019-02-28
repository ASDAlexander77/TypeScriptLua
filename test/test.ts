import './JS';

function f() {
    console.log(new Date().now());
}

for (let i = 0; i < 100000; i++) {
    f();
}
