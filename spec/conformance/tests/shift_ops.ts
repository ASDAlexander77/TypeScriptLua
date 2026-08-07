function _panic(code: number): void {
    assert(false, `error code: ${code}`);
}

function isEq(x: any, y: any): void {
    if (x !== y) {
        console.log(`fail: ${x} !== ${y}`)
        _panic(1)
    }
}

let v10 = 10
let v16 = 16
let vneg16 = -16

// shift-count masking (mod 32) for shift counts >= 32 or negative
// fixed: LowerToLLVM.cpp (ArithmeticBinaryOpLowering) and MLIRGen.cpp (evaluateBinaryOp constant folding)
// were emitting raw LLVM shl/ashr/lshr without masking the shift amount, which is
// undefined behavior for counts >= bit width and produced garbage under -O3.
isEq(v10 << 100, 160)   // 100 & 31 = 4 -> 10 << 4 = 160
isEq(v10 << 32, 10)     // 32 & 31 = 0
isEq(v10 << 33, 20)     // 33 & 31 = 1
isEq(v10 << 34, 40)     // 34 & 31 = 2
isEq(v16 >> 35, 2)      // 35 & 31 = 3 -> 16 >> 3 = 2
isEq(v16 >>> 35, 2)
isEq(vneg16 >> 35, -2)
isEq(10 << 100, 160)    // same masking must apply to compile-time-constant expressions

console.log("all OK")

console.log("ALL DONE");
