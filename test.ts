class Person {
    public name: string;
    constructor(name: string) {
        console.log('ctor Person');
        this.name = name;
    }
}

class Employee extends Person {
    public department: string;

    constructor(name: string, department: string) {
        console.log('ctor Employee');
        super(name);
        this.department = department;
    }

    public get ElevatorPitch() {
        return `Hello, my name is ${this.name} and I work in ${this.department}.`;
    }
}

let howard = new Employee('Howard', 'Sales');
console.log(howard.name);
console.log(howard.department);
// console.log(howard.ElevatorPitch());
