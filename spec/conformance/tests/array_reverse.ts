function main() {

    // if you put const, array1 will not be changed with calling reverse but result of reverse will be correct
    let array1 = ['one', 'two', 'three'];
    console.log('array1:', array1.join());
    // Expected output: "array1:" Array ["one", "two", "three"]
    
    const reversed = array1.reverse();
    console.log('reversed:', reversed);
    // Expected output: "reversed:" Array ["three", "two", "one"]
    
    // Careful: reverse is destructive -- it changes the original array.
    console.log('array1:', array1.join());
    // Expected output: "array1:" Array ["three", "two", "one"]
    console.log("ALL DONE");
}
