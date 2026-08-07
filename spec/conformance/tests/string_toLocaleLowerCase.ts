function main()
{
  const dotted = 'İstanbul';

  console.log(`EN-US: ${dotted.toLocaleLowerCase('en-US')}`);
  // Expected output: "i̇stanbul"
  
  console.log(`TR: ${dotted.toLocaleLowerCase('tr')}`);
  // Expected output: "istanbul"  

  console.log("ALPHABET".toLocaleLowerCase()); // 'alphabet'
    console.log("ALL DONE");
}
