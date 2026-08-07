
function _panic(code: number): void {
    assert(false, `error code: ${code}`);
}

function isClose(x: number, y: number): void {
    if (isNaN(x) && isNaN(y)) return
    const d = Math.abs(x - y)
    if (d < 0.00000001 || d / Math.abs(x + y) < 0.00001) return
    console.log(x, " !== ", y, "!")
    _panic(108)
}

function isEq(x: any, y: any): void {
    // console.log(x, " === ", y, "?")
    if (x !== y) {
        console.log(`fail: ${x} !== ${y}`)
        _panic(109)
    }
}

function strEq(a: string, b: string) {
    if (a !== b) {
        console.log(`fail: '${a}' !== '${b}'`)
        _panic(110)
    }
}

let x = 0
let glb1 = 0

function testFlow() {
    x = 1
    if (x !== 1) _panic(1)
    if (x !== 1) _panic(1)
    if (x === 1) {
        x = 2
        if (x !== 2) _panic(3)
    } else {
        _panic(2)
    }
    x = 1
    if (x < 1) _panic(1)
    if (x > 1) _panic(1)
    if (x >= 1) {
    } else _panic(1)
    if (x <= 1) {
    } else _panic(1)
    if (x < 0.5) _panic(1)
    if (x > 1.5) _panic(1)
    if (0 <= x && x <= 2) {
    } else _panic(1)
    if (0 <= x || x < 1) {
    } else _panic(1)
    if (x < 0 || x > 10) _panic(1)
    x = -1
    if (Math.abs(x) !== 1) _panic(4)
    x = Math.random()
    if (x < 0 || x > 1 || isNaN(x)) _panic(5)
    x = 42
    console.log("rand=", Math.random())

    //isEq(ds.SystemStatusCodes.CalibrationNeeded, 100)
}

function testMath() {
    // these are here to avoid constant folding
    let v0 = 0
    let v1 = 1
    let v2 = 2
    let v3 = 3
    let v7 = 7
    let v10 = 10
    let v100 = 100
    let vffff = 0xffff

    // TODO use let ... to avoid constant folding
    isEq(v2 + 2, 4)
    isEq(v2 - 1, 1)
    isClose(v3 * 4 + 3, 15.00001)
    isEq(Math.abs(v10), 10)
    isEq(Math.abs(-v10), 10)
    isEq(Math.abs(v0), 0)
    isClose(Math.log(Math.E), 1)
    isClose(Math.log(1.23456), 0.21071463)
    //isClose(Math.log(-v1), NaN)
    //isClose(v0 / 0, NaN)
    isClose(Math.log2(Math.PI), 1.651496129)
    isClose(Math.log10(Math.PI), 0.49714987269)
    isClose(Math.pow(v2, 0.5), Math.SQRT2)
    isClose(v2 ** 0.5, Math.SQRT2)
    isClose(Math.sqrt(v1 / 2), Math.SQRT1_2)
    isClose(Math.cbrt(27), 3)
    isClose(Math.exp(v1), Math.E)
    isClose(Math.exp(v10), 22026.4657948)
    isEq(Math.ceil(0.1), 1)
    isEq(Math.ceil(0.9), 1)
    isEq(Math.floor(1.1), 1)
    isEq(Math.floor(1.9), 1)
    isEq(Math.round(1.9), 2)
    isEq(Math.round(1.3), 1)
    isEq(Math.min(1, 7.1), 1)
    isEq(Math.min(1.2, 1.2), 1.2)
    isEq(Math.min(-1, -7), -7)
    isEq(Math.max(1, 7), 7)
    isEq(Math.max(1, 1), 1)
    isEq(Math.max(-1, -7), -1)

    isEq(fib(8), 21)
    isEq(fibx(8), 21)

    isEq(v1 & 3, 1)
    isEq(v1 & 0, 0)
    isEq(v1 & 2, 0)
    isEq(v1 | 3, 3)
    isEq(v1 | 0, 1)
    isEq(v1 | 2, 3)
    isEq(v1 ^ 3, 2)
    isEq(v1 ^ 0, 1)
    isEq(v1 ^ 2, 3)
    isEq(~-v3, 2)
    isEq(~v100, -101)

    isEq(v1 << 2, 4)
    isEq(16 >> v3, 2)
    isEq(16 >>> v3, 2)
    isEq(-16 >> v3, -2)
    isEq(-16 >>> v3, 536870910)
    isEq(v10 << -1, 0)
    isEq(v10 << 0, 10)
    isEq(v10 << 0.5, 10)
    isEq(v10 << 1.7, 20)
    isEq(v10 << 2.1, 40)
    isEq(v10 << 100, 160)
    isEq(v10 << 20, 10485760)
    isEq(v10 << 30, -2147483648)
    isEq(v10 << 31, 0)
    isEq(v10 << 32, 10)
    isEq(v10 << 33, 20)
    isEq(v10 << 34, 40)
    isEq(v1 << -1, -2147483648)

    let v102 = 102
    let v7ffff = 0x7ffff

    isEq(Math.imul(v10, 30), 300)
    isEq(Math.imul(vffff, 0xffff), -131071)
    isEq(Math.imul(vffff, 0xffff1), -2031601)
    isEq(Math.imul(vffff, 0xffff11), -32440081)
    isEq(Math.imul(vffff, 0xffff111), -518975761)
    isEq(Math.imul(vffff, 0x7fff1111), -1861095697)
    isEq(Math.imul(v7ffff, 0x7fff1111), 143191791)
    // isEq(Math.idiv(100, v10), 10)
    // isEq(Math.idiv(102, v10), 10)
    // isEq(Math.idiv(-102, v10), -10)
    // isEq(Math.idiv(v102, 7), 14)
    // isEq(Math.idiv(-v102, 7), -14)
}

function fib(k: number): number {
    if (k < 2) return k
    const r = fib(k - 1) + fib(k - 2)
    return r
}

function fibx(k: number): number {
    if (k < 2) return k
    return fibx(k - 1) + fibx(k - 2)
}

function three(a: number, b: number, c: number) {
    return a / b + c
}

testFlow()
testMath()

console.log("all OK")

console.log("ALL DONE");
