async function get_with_delay() {
	sleep(1000); 
	return 10;
}

const r = await get_with_delay();
console.log(`result = ${r}`);

console.log("ALL DONE");
