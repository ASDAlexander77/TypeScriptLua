function main() {
  const paragraph = "I think Ruth's dog is cuter than your dog!";

  const searchTerm = 'dog';
  const indexOfFirst = paragraph.indexOf(searchTerm);

  console.log(`The index of the first "${searchTerm}" is ${indexOfFirst}`);
  // Expected output: "The index of the first "dog" is 15"

  console.log(
    `The index of the second "${searchTerm}" is ${paragraph.indexOf(
      searchTerm,
      indexOfFirst + 1,
    )}`,
  );
  // Expected output: "The index of the second "dog" is 38"

  console.log("hello world".indexOf("")); // returns 0
  console.log("hello world".indexOf("", 0)); // returns 0
  console.log("hello world".indexOf("", 3)); // returns 3
  console.log("hello world".indexOf("", 8)); // returns 8

  console.log("hello world".indexOf("", 11)); // returns 11
  console.log("hello world".indexOf("", 13)); // returns 11
  console.log("hello world".indexOf("", 22)); // returns 11

  console.log("Blue Whale".indexOf("Blue")); // returns  0
  console.log("Blue Whale".indexOf("Blute")); // returns -1
  console.log("Blue Whale".indexOf("Whale", 0)); // returns  5
  console.log("Blue Whale".indexOf("Whale", 5)); // returns  5
  console.log("Blue Whale".indexOf("Whale", 7)); // returns -1
  console.log("Blue Whale".indexOf("")); // returns  0
  console.log("Blue Whale".indexOf("", 9)); // returns  9
  console.log("Blue Whale".indexOf("", 10)); // returns 10
  console.log("Blue Whale".indexOf("", 11)); // returns 10  


  const str = "To be, or not to be, that is the question.";
  let count = 0;
  let position = str.indexOf("e");
  
  while (position !== -1) {
    count++;
    position = str.indexOf("e", position + 1);
  }
  
  console.log(count); // 4  
    console.log("ALL DONE");
}
