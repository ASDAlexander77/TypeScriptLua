function main() {

  const array1 = ['a', 'b', 'c'];
  let iterator = array1.keys();
  
  for (const key of iterator) {
    console.log(key);
  }
  
  // Expected output: 0
  // Expected output: 1
  // Expected output: 2
  
    console.log("ALL DONE");
}
