function main() {

    const objects = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const sum = objects.reduce(
      (accumulator, currentValue) => accumulator + currentValue.x,
      0,
    );
    
    console.log(sum); // 6    
    console.log("ALL DONE");
}
  
