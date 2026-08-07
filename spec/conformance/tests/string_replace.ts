const paragraph = "I think Ruth's dog is cuter than your dog!";

console.log(paragraph.replace("Ruth's", "my"));
// Expected output: "I think my dog is cuter than your dog!"

assert(paragraph.replace("Ruth's", "my") == "I think my dog is cuter than your dog!");

assert("xxx".replace("", "_") == "_xxx");

const regex = /Dog/i;
console.log(paragraph.replace(regex, "ferret"));
// Expected output: "I think Ruth's ferret is cuter than your dog!"

assert(paragraph.replace(regex, "ferret") == "I think Ruth's ferret is cuter than your dog!");

console.log("ALL DONE");
