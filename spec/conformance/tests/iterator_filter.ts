function* fibonacci() {
  let current = 1;
  let next_ = 1;
  while (true) {
    yield current;
    [current, next_] = [next_, current + next_];
  }
}

const seq = fibonacci().filter((x) => x % 2 === 0);
assert(seq.next().value == 2); // 2
assert(seq.next().value == 8); // 8
assert(seq.next().value == 34); // 34

for (const n of fibonacci().filter((x) => x % 2 === 0)) {
  console.log(n);
  if (n > 30) {
    break;
  }
}

// Logs:
// 2
// 8
// 34

console.log("ALL DONE");
