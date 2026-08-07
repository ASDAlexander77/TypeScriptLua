function main() {
    const paragraph = "I think Ruth's dog is cuter than your dog!";

    const searchTerm = 'dog';
    
    console.log(
      `Index of the last ${searchTerm} is ${paragraph.lastIndexOf(searchTerm)}`,
    );
    // Expected output: "Index of the last "dog" is 38"    

    console.log("canal".lastIndexOf("a")); // returns 3
    console.log("canal".lastIndexOf("a", 2)); // returns 1
    console.log("canal".lastIndexOf("a", 0)); // returns -1
    console.log("canal".lastIndexOf("x")); // returns -1
    console.log("canal".lastIndexOf("c", -5)); // returns 0
    console.log("canal".lastIndexOf("c", 0)); // returns 0
    console.log("canal".lastIndexOf("")); // returns 5
    console.log("canal".lastIndexOf("", 2)); // returns 2

    console.log("Blue Whale, Killer Whale".lastIndexOf("blue")); // returns -1
    console.log("ALL DONE");
}
