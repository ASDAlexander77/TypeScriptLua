function* fibonacci() {
    let current = 1;
    let next_ = 1;
    while (true) {
        yield current;
        [current, next_] = [next_, current + next_];
    }
}

const isEven = (x) => x % 2 === 0;
assert(fibonacci().some(isEven)); // true

const isNegative = (x) => x < 0;
assert(!fibonacci().take(10).some(isNegative)); // false
//console.log(fibonacci().some(isNegative)); // Never completes

console.log("ALL DONE");
