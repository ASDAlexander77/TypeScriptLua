import './JS';

class Person {
    protected name: string;
    constructor(name: string) { this.Name = name; }
    public get ElevatorPitch() {
        return `Hello, my name is ${this.Name} and I work in ${this.department}.`;
    }

    public get Name() {
        return this.name;
    }

    public set Name(val: string) {
        this.name = val;
    }
}

class Employee extends Person {
    private department: string;

    constructor(name: string, department: string) {
        super(name);
        this.Department = department;
    }

    public get Department() {
        return this.department;
    }

    public set Department(val: string) {
        this.department = val;
    }
}

const howard = new Employee('Howard', 'Sales');
console.log(howard.ElevatorPitch);
