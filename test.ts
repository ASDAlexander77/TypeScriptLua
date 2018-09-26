let options = {
    b1: false
};

let mergedOptions = {
    bilinearFiltering: false,
    comparisonFunction: 0,
    generateStencil: false,
    ...options
};

/*
for (let i in options) {
	mergedOptions[i] = options[i];
}
*/

console.log(mergedOptions.comparisonFunction);
console.log(mergedOptions.b1);
