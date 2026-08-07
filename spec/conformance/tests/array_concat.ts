let fruits = ["banana", "apple", "peach"];
console.log(fruits.length); 

const newFruits = fruits.concat(["banana", "apple", "peach"]);

for (const fruit of fruits) console.log("item = ", fruit);
for (const fruit of newFruits) console.log("item = ", fruit);

assert(fruits.length == 3)
assert(newFruits.length == 6)

assert(newFruits.toString() == "banana,apple,peach,banana,apple,peach");

console.log("ALL DONE");
