function* fibonacci() {
    let current = 1;
    let next_ = 1;
    while (true) {
        yield current;
        [current, next_] = [next_, current + next_];
    }
}

const seq = fibonacci().take(3);
console.log(seq.next().value); // 1
console.log(seq.next().value); // 1
console.log(seq.next().value); // 2
console.log(seq.next().value); // undefined

for (const n of fibonacci().take(5)) {
    console.log(n);
}

// Logs:
// 1
// 1
// 2
// 3
// 5

for (const n of fibonacci().drop(2).take(5)) {
    // Drops the first two elements, then takes the next five
    console.log(n);
}
// Logs:
// 2
// 3
// 5
// 8
// 13

for (const n of fibonacci().take(5).drop(2)) {
    // Takes the first five elements, then drops the first two
    console.log(n);
}
// Logs:
// 2
// 3
// 5

for (const n of new Set([1, 2, 3]).values().take(Infinity)) {
    console.log(n);
}

// Logs:
// 1
// 2
// 3

console.log("ALL DONE");
