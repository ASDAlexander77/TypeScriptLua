import './JS';

function f() {
    var a = 10;
    return function g() {
        const sss = _ENV;
        var b = a + 1;
        return b;
    }
}

var g = f();
console.log(g());
