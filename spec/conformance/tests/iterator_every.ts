function* fibonacci() {
  let current = 1;
  let next_ = 1;
  while (true) {
    yield current;    
    [current, next_] = [next_, current + next_];
  }
}

const isEven = (x) => x % 2 === 0;
assert(!fibonacci().every(isEven)); // false


const isPositive = (x) => x > 0;
assert(fibonacci().take(10).every(isPositive)); // true
//console.log(fibonacci().every(isPositive)); // Never completes

console.log("ALL DONE");
