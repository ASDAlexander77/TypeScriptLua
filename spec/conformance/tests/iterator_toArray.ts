function* fibonacci() {
    let current = 1;
    let next_ = 1;
    while (true) {
        yield current;
        [current, next_] = [next_, current + next_];
    }
}

const array = fibonacci()
    .take(10)
    .filter((x) => x % 2 === 0)
    .toArray();

console.log(array); // [2, 8, 34]

console.log("ALL DONE");
