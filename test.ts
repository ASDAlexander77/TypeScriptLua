class Class1 {
}

class Class2 extends Class1 {
}


let c2 = new Class2();
console.log(c2.__index);
console.log(Class2);
console.log(Class2.__index);
console.log(Class1);

