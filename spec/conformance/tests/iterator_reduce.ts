function* fibonacci() {
    let current = 1;
    let next_ = 1;
    while (true) {
        yield current;
        [current, next_] = [next_, current + next_];
    }
}

assert(
    fibonacci()
        .take(10)
        .reduce((a, b) => a + b) == 143
); // 143


console.log(
    fibonacci()
        .take(10)
        .reduce((a, b) => "#" + a + " + " + b, ""),
); // 143

console.log("ALL DONE");
