function main() {
    let months = ['March', 'Jan', 'Feb', 'Dec'];
    months.sort();
    console.log(months);
    // Expected output: Array ["Dec", "Feb", "Jan", "March"]
    
    let array1 = [1, 30, 4, 21, 100000];
    array1.sort();
    console.log(array1);
    // Expected output: Array [1, 100000, 21, 30, 4]

    let numberArray = [40, 1, 5, 200];
    numberArray.sort((a, b) => a - b); 
    console.log(numberArray);
    // [1, 5, 40, 200]
    console.log("ALL DONE");
}
