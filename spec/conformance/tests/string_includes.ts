function main() {
  const sentence = 'The quick brown fox jumps over the lazy dog.';

  const word = 'fox';
  
  console.log(
    `The word "${word}" ${
      sentence.includes(word) ? 'is' : 'is not'
    } in the sentence`,
  );
  // Expected output: "The word "fox" is in the sentence"

  const str = "To be, or not to be, that is the question.";

  console.log(str.includes("To be")); // true
  console.log(str.includes("question")); // true
  console.log(str.includes("nonexistent")); // false
  console.log(str.includes("To be", 1)); // false
  console.log(str.includes("TO BE")); // false
  console.log(str.includes("")); // true  
    console.log("ALL DONE");
}
