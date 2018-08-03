function buildName(firstName, lastName) {
    if (lastName === void 0) { lastName = "Smith"; }
    return firstName + " " + lastName;
}
var result1 = buildName("Bob", "Adams");
var result2 = buildName("Bob");
console.log(result1);
console.log(result2);
