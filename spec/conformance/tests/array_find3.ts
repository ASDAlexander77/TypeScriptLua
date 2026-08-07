function main() {

  const inventory = [
    { name: "apples", quantity: 2 },
    { name: "bananas", quantity: 0 },
    { name: "cherries", quantity: 5 },
  ];

  const result = inventory.find(({ name }) => name === "cherries");

  console.log(result); 
  // { name: 'cherries', quantity: 5 }
  
    console.log("ALL DONE");
}
