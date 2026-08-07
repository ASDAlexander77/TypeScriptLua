function main() {
  const sentence = 'The quick brown fox jumps over the lazy dog.';

  let index = 5;
  
  console.log(`An index of ${index} returns the character ${sentence.at(index)} ${sentence[5]}`);
  // Expected output: "An index of 5 returns the character u"
  
  index = -4;
  
  console.log(`An index of ${index} returns the character ${sentence.at(index)} ${sentence[40]}`);
  // Expected output: "An index of -4 returns the character d"
    console.log("ALL DONE");
}
