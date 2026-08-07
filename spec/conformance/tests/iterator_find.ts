function* fibonacci() {
  let current = 1;
  let next_ = 1;
  while (true) {
    yield current;
    [current, next_] = [next_, current + next_];
  }
}

const isEven = (x) => x % 2 === 0;
console.log(fibonacci().find(isEven)); // 2
assert(fibonacci().find(isEven) == 2); // 2

const isNegative = (x) => x < 0;
console.log(fibonacci().take(10).find(isNegative)); // undefined
//console.log(fibonacci().find(isNegative)); // Never completes

assert(fibonacci().take(10).find(isNegative) == undefined); // undefined

const seq = fibonacci();
console.log(seq.find(isEven)); // 2
// TODO: finish it, 
// Calling find() always closes the underlying iterator, even if the method early-returns. The iterator is never left in a half-way state.
console.log(seq.next()); // { value: undefined, done: true }

console.log("ALL DONE");
