import './JS';

var person = { fname: "John", lname: "Doe", age: 25 };

var x;
for (x in person) {
    console.log(person[x]);
}
