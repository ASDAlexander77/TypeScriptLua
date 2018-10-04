class Person {
    protected name: string;
    constructor(name: string) { console.log('Person', this); this.name = name; }
}

class Employee extends Person {
    private department: string;

    constructor(name: string, department: string) {
        super(name);
        console.log('Employee', this);
        this.department = department;
    }

    public get ElevatorPitch() {
        console.log('ElevatorPitch', this);
        return `Hello, my name is ${this.name} and I work in ${this.department}.`;
    }
}

let howard = new Employee("Howard", "Sales");
console.log('howard', this);
console.log(howard.ElevatorPitch);
