function main() {

	const array1 = ['a', 'b', 'c'];

	// do not put ''const'' here, otherwise it will not iterate
	let iterator1 = array1.entries();
	let [i, v] = iterator1.next().value;
	console.log(i, v);
	// Expected output: Array [0, "a"]
	
	[i, v] = iterator1.next().value;
	console.log(i, v);
	// Expected output: Array [1, "b"]
    console.log("ALL DONE");
}
