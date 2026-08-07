function main() {

    const getMax = (a, b) => Math.max(a, b);

    // callback is invoked for each element in the array starting at index 0
    [1, 100].reduce(getMax, 50); // 100
    [50].reduce(getMax, 10); // 50
    
    // callback is invoked once for element at index 1
    [1, 100].reduce(getMax); // 100
    
    // callback is not invoked
    [50].reduce(getMax); // 50
    console.log("ALL DONE");
}
