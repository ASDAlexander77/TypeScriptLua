function main() {

  const numbers = [2, 5, 9, 2];
  console.log(numbers.lastIndexOf(2)); // 3
  console.log(numbers.lastIndexOf(7)); // -1
  console.log(numbers.lastIndexOf(2, 3)); // 3
  console.log(numbers.lastIndexOf(2, 2)); // 0
  console.log(numbers.lastIndexOf(2, -2)); // 0
  console.log(numbers.lastIndexOf(2, -1)); // 3
  
  
    console.log("ALL DONE");
}
