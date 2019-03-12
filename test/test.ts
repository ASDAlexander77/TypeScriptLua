import './JS';

function log(target: Function, key: string, value: any) {

    // target === C.prototype
    // key === "foo"
    // value === Object.getOwnPropertyDescriptor(C.prototype, "foo")

    return {
        value: function (...args: any[]) {
            console.log(`Call: ...`);

            return 2;
        }
    };
}

class C {
    @log
    foo(n: number) {
        return n * 2;
    }
}

const c = new C();
const r = c.foo(23);

console.log(r);
