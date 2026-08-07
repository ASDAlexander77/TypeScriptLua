function main() {

  const array1 = [1, 4, 9, 16];

  // Pass a function to map
  const map1 = array1.map<TypeOf<1>>((x: TypeOf<1>) => x * 2);
  
  console.log(map1.join());
  // Expected output: Array [2, 8, 18, 32]

  // Pass a function to map
  const map2 = array1.map((x: TypeOf<1>) => x * 2);
  
  console.log(map2.join());
  // Expected output: Array [2, 8, 18, 32]

  // Pass a function to map
  const map3 = array1.map((x) => x * 2);
  
  console.log(map3.join());
  // Expected output: Array [2, 8, 18, 32]

    console.log("ALL DONE");
}
