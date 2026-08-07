function main() {

  const array1 = [1, 2, 3, 4];

  // 0 + 1 + 2 + 3 + 4
  const initialValue = 0;
  const sumWithInitial = array1.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    initialValue,
  );

  console.log(sumWithInitial);
  // Expected output: 10


  const sumWithInitial2 = array1.reduce(
    (accumulator: int, currentValue) => accumulator + currentValue,
  );

  console.log(sumWithInitial2);

  const sumWithInitial3 = array1.reduce<int>(
    (accumulator, currentValue) => accumulator + currentValue,
  );

  console.log(sumWithInitial3);

  const sumWithInitial4 = array1.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
  );

  console.log(sumWithInitial4);  

    console.log("ALL DONE");
}
