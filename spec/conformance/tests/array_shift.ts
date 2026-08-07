function main() {

    let array1 = [1, 2, 3];

    const firstElement = array1.shift();
    
    console.log(array1.length, array1);
    // Expected output: Array [2, 3]
    
    console.log(firstElement);
    // Expected output: 1
    
    console.log("ALL DONE");
}
