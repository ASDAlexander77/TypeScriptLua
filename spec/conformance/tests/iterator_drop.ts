function* fibonacci() {
  let current = 1;
  let next_ = 1; // can't use next as next is method of iterator
  while (true) {
    yield current;
    [current, next_] = [next_, current + next_];
  }
}

// 1
const seq = fibonacci().drop(2);

//console.log(seq.next().value);
//console.log(seq.next().value);
console.log(seq.next().value); // 2
console.log(seq.next().value); // 3

// 2
for (const n of fibonacci().drop(2)) {
  console.log(n);
  if (n > 30) {
    break;
  }
}

// 3
console.log("Logs:");
for (const n of fibonacci().drop(2).take(5)) {
  // Drops the first two elements, then takes the next five
  console.log(n);
}

// 4
console.log("Logs:");
for (const n of fibonacci().take(5).drop(2)) {
  // Takes the first five elements, then drops the first two
  console.log(n);
}

// 5
const result = new Set([1, 2, 3]).values().drop(4).next();
console.log(result);

assert(<string>result == "{ value: undefined, done: true }");

console.log("ALL DONE");
