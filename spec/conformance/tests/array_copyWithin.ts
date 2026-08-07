function main() {

	let array1 = ['a', 'b', 'c', 'd', 'e'];

	// Copy to index 0 the element at index 3
	console.log(array1.copyWithin(0, 3, 4));
	// Expected output: Array ["d", "b", "c", "d", "e"]

	// Copy to index 1 all elements from index 3 to the end
	console.log(array1.copyWithin(1, 3));
	// Expected output: Array ["d", "d", "e", "d", "e"]


	console.log([1, 2, 3, 4, 5].copyWithin(0, 3));
	// [4, 5, 3, 4, 5]

	console.log([1, 2, 3, 4, 5].copyWithin(0, 3, 4));
	// [4, 2, 3, 4, 5]

	console.log([1, 2, 3, 4, 5].copyWithin(-2, -3, -1));
	// [1, 2, 3, 3, 4]
    console.log("ALL DONE");
}
