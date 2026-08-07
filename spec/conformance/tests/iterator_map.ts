function* fibonacci() {
    let current = 1;
    let next_ = 1;
    while (true) {
        yield current;
        [current, next_] = [next_, current + next_];
    }
}

// 1
const seq = fibonacci().map((x) => x ** 2);
assert(seq.next().value == 1); // 1
assert(seq.next().value == 1); // 1
assert(seq.next().value == 4); // 4

// 2
for (const n of fibonacci().map((x) => x ** 2)) {
    console.log(n);
    if (n > 30) {
        break;
    }
}

console.log("ALL DONE");
