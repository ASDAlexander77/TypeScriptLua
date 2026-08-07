function main() {

  const array1 = [1, 2, 3];

  console.log(array1.includes(2));
  // Expected output: true
  
  const pets = ['cat', 'dog', 'bat'];
  
  console.log(pets.includes('cat'));
  // Expected output: true
  
  console.log(pets.includes('at'));
  // Expected output: false

  let a = [1, 2, 3];
  //let b = ["1", "2", "3"];

  a.forEach((e) => console.log(e));

  //a.includes(2); // true
  //a.includes(4); // false
  //a.includes(3, 3); // false
  //a.includes(3, -1); // true
  //[1, 2, NaN].includes(NaN); // true
  //b.includes(<string>3); // false
    console.log("ALL DONE");
}
