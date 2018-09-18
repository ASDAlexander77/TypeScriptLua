function buildName(firstName: string, lastName = "Smith") {
    return firstName + " " + lastName;
}

let result1 = buildName("Bob");                  
let result2 = buildName("Bob", undefined);       
let result3 = buildName("Bob", "Adams");

console.log(result1);
console.log(result2);
console.log(result3);