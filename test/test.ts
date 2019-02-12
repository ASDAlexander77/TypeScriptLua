import './JS';

print(undefined);

if (undefined) {
	console.log('not working 1');
}

if (!undefined) {
	console.log('working');
} else {
	console.log('not working 2');
}


console.log(undefined == undefined);
console.log(undefined == 1);
