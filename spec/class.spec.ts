import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Classes', () => {

    it('Class static member', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public static show() {                      \
                console.log("Hello");                   \
            }                                           \
        }                                               \
                                                        \
        Class1.show();                                  \
    '])));

    it('Class static member with parameter', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public static show(s:string) {              \
                console.log(s);                         \
            }                                           \
        }                                               \
                                                        \
        Class1.show("Hello");                           \
    '])));

    it('new instance of Class with parametered member', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public show(s:string) {                     \
                console.log(s);                         \
            }                                           \
        }                                               \
                                                        \
        new Class1().show("Hello");                     \
    '])));

    it('new instance of Class with parametered member into local', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public show(s:string) {                     \
                console.log(s);                         \
            }                                           \
        }                                               \
                                                        \
        let c = new Class1();                           \
        c.show("Hello");                                \
    '])));

    it('new instance of Class with setting class field', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
                                                        \
            public set(s: string): Class1 {             \
                this.val = s;                           \
                return this;                            \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
            }                                           \
        }                                               \
                                                        \
        new Class1().set("Hello").show();               \
    '])));

    it('new instance of Class with setting class field via local', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
                                                        \
            public set(s: string): Class1 {             \
                this.val = s;                           \
                return this;                            \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
            }                                           \
        }                                               \
                                                        \
        let c = new Class1();                           \
        c.set("Hello").show();                          \
    '])));

    it('new instance of Class with setting class field via global', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
                                                        \
            public set(s: string): Class1 {             \
                this.val = s;                           \
                return this;                            \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
            }                                           \
        }                                               \
                                                        \
        var c = new Class1();                           \
        c.set("Hello").show();                          \
    '])));

    it('Class private member in constructor', () => expect('1\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            constructor(private i: number) {                \
            }                                               \
                                                            \
            public show() {                                 \
              console.log(this.i);                          \
            }                                               \
          }                                                 \
                                                            \
          let c = new Class1(1);                            \
          c.show();                                         \
                                                            \
    '])));

    it('Class inheritance', () => expect('false\r\nfalse\r\ntrue\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            public method1(): boolean {                     \
                return false;                               \
            }                                               \
        }                                                   \
        class Class2 extends Class1 {                       \
            public method2(): boolean {                     \
                return true;                                \
            }                                               \
        }                                                   \
        const c1 = new Class1();                            \
        console.log(c1.method1());                          \
        const c2 = new Class2();                            \
        console.log(c2.method1());                          \
        console.log(c2.method2());                          \
    '])));

    it('Class inheritance - call super class', () => expect('false\r\nfalse\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            public method1(): boolean {                     \
                return false;                               \
            }                                               \
        }                                                   \
        class Class2 extends Class1 {                       \
            public method1(): boolean {                     \
                return super.method1();                     \
            }                                               \
        }                                                   \
        const c1 = new Class1();                            \
        console.log(c1.method1());                          \
        const c2 = new Class2();                            \
        console.log(c2.method1());                          \
    '])));

    it('Class inheritance - instance', () => expect('true\r\ntrue\r\nfalse\r\n').to.equals(new Run().test([
        'class Class1 {                                             \
        }                                                           \
                                                                    \
        class Class2 extends Class1 {                               \
        }                                                           \
                                                                    \
        class Class3 {                                              \
        }                                                           \
                                                                    \
        let c2 = new Class2();                                      \
        console.log(c2 instanceof Class2);                          \
        console.log(c2 instanceof Class1);                          \
        console.log(c2 instanceof Class3);                          \
    '])));

    it('Class inheritance - complete example',  () => expect('Hello, my name is Howard and I work in Sales.\r\n').to.equals(new Run().test([
        'class Person {                                                 \
            protected name: string;                                     \
            constructor(name: string) { this.name = name; }             \
        }                                                               \
                                                                        \
        class Employee extends Person {                                 \
            private department: string;                                 \
                                                                        \
            constructor(name: string, department: string) {             \
                super(name);                                            \
                this.department = department;                           \
            }                                                           \
                                                                        \
            public getElevatorPitch() {                                 \
                return `Hello, my name is ${this.name} and I work in ${this.department}.`;  \
            }                                                           \
        }                                                               \
                                                                        \
        let howard = new Employee("Howard", "Sales");                   \
        console.log(howard.getElevatorPitch());                         \
    '])));

    it('Class inheritance - complete example with property',
    () => expect('Hello, my name is Howard and I work in Sales.\r\n').to.equals(new Run().test([
        'class Person {                                                 \
            protected name: string;                                     \
            constructor(name: string) { this.name = name; }             \
        }                                                               \
                                                                        \
        class Employee extends Person {                                 \
            private department: string;                                 \
                                                                        \
            constructor(name: string, department: string) {             \
                super(name);                                            \
                this.department = department;                           \
            }                                                           \
                                                                        \
            public get ElevatorPitch() {                                 \
                return `Hello, my name is ${this.name} and I work in ${this.department}.`;  \
            }                                                           \
        }                                                               \
                                                                        \
        let howard = new Employee("Howard", "Sales");                   \
        console.log(howard.ElevatorPitch);                              \
    '])));

    it('Class - default ctor - readonly',  () => expect('8\r\n').to.equals(new Run().test([
        'class Octopus {                                                \
            readonly numberOfLegs: number = 8;                          \
        }                                                               \
                                                                        \
        let dad = new Octopus();                                        \
        console.log(dad.numberOfLegs);                                  \
        '])));

    it('Class - readonly',  () => expect('8\r\n').to.equals(new Run().test([
        'class Octopus {                                                \
            readonly name: string;                                      \
            readonly numberOfLegs: number = 8;                          \
            constructor (theName: string) {                             \
                this.name = theName;                                    \
            console.log(this.numberOfLegs);                             \
            }                                                           \
        }                                                               \
                                                                        \
        let dad = new Octopus("Man with the 8 strong legs");            \
    '])));

    // function is not using 'this' and thus making issue with parameters
    it.skip('Class - generic',  () => expect('8\r\n').to.equals(new Run().test([
        'class GenericNumber<T> {                                           \
            zeroValue: T;                                                   \
            add: (x: T, y: T) => T;                                         \
        }                                                                   \
                                                                            \
        let stringNumeric = new GenericNumber<string>();                    \
        stringNumeric.zeroValue = "";                                       \
        stringNumeric.add = function(x: string, y: string) { return x + y; }; \
                                                                            \
        console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));    \
    '])));

    it('Class - generic 2',  () => expect('2\r\n1\r\n').to.equals(new Run().test([
        'class Animal {                                                     \
            protected constructor(public numLegs: number) {                 \
            }                                                               \
        }                                                                   \
                                                                            \
        class Bee extends Animal {                                          \
            public constructor() {                                          \
                super(1);                                                   \
            }                                                               \
        }                                                                   \
                                                                            \
        class Lion extends Animal {                                         \
            public constructor() {                                          \
                super(2);                                                   \
            }                                                               \
        }                                                                   \
                                                                            \
        function createInstance<A extends Animal>(c: new () => A): A {      \
            return new c();                                                 \
        }                                                                   \
                                                                            \
        console.log(createInstance(Lion).numLegs);                          \
        console.log(createInstance(Bee).numLegs);                           \
    '])));

    it('Class - Accessors',  () => expect('Bob Smith\r\nBob Smith\r\n').to.equals(new Run().test([
        'class Employee {                                                   \
            _fullName: string;                                              \
                                                                            \
            get fullName(): string {                                        \
                return this._fullName;                                      \
            }                                                               \
                                                                            \
            set fullName(newName: string) {                                 \
                this._fullName = newName;                                   \
            }                                                               \
        }                                                                   \
                                                                            \
        let employee = new Employee();                                      \
        employee.fullName = "Bob Smith";                                    \
        console.log(employee.fullName);                                     \
        console.log(employee._fullName);                                    \
    '])));

    it('Class - Accessors 2',  () => expect('Hello, my name is Howard and I work in Sales.\r\n').to.equals(new Run().test([
        'class Person {                                                     \
            protected name: string;                                         \
            constructor(name: string) { this.name = name; }                 \
        }                                                                   \
                                                                            \
        class Employee extends Person {                                     \
            private department: string;                                     \
                                                                            \
            constructor(name: string, department: string) {                 \
                super(name);                                                \
                this.department = department;                               \
            }                                                               \
                                                                            \
            public get ElevatorPitch() {                                    \
                return `Hello, my name is ${this.name} and I work in ${this.department}.`;  \
            }                                                               \
        }                                                                   \
                                                                            \
        let howard = new Employee("Howard", "Sales");                       \
        console.log(howard.ElevatorPitch);                                  \
    '])));

    it('Class - Static Properties',  () => expect('14.142135623731\r\n2.8284271247462\r\n').to.equals(new Run().test([
        'class Grid {                                                       \
            static origin = {x: 0, y: 0};                                   \
            calculateDistanceFromOrigin(point: {x: number; y: number;}) {   \
                let xDist = (point.x - Grid.origin.x);                      \
                let yDist = (point.y - Grid.origin.y);                      \
                return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale;\
            }                                                               \
            constructor (public scale: number) { }                          \
        }                                                                   \
                                                                            \
        let grid1 = new Grid(1.0);                                          \
        let grid2 = new Grid(5.0);                                          \
                                                                            \
        console.log(grid1.calculateDistanceFromOrigin({x: 10, y: 10}));     \
        console.log(grid2.calculateDistanceFromOrigin({x: 10, y: 10}));     \
    '])));

    it('Class - Properties - Arrow Function',  () => expect('test\r\n').to.equals(new Run().test([
        'class Event1 {                                                     \
            public message: string;                                         \
        }                                                                   \
                                                                            \
        class Handler {                                                     \
            info: string;                                                   \
            onClickGood = (e: Event1) => { this.info = e.message; };        \
        }                                                                   \
                                                                            \
        let h = new Handler();                                              \
        let m = new Event1();                                               \
        m.message = "test";                                                 \
        h.onClickGood(m);                                                   \
        console.log(h.info);                                                \
    '])));

    it('Class - static - method call',  () => expect('1\r\n').to.equals(new Run().test([
        'export class Matrix {                                          \
            public static _identityReadOnly = Matrix.Identity();        \
                                                                        \
            public static Identity(): number {                          \
                return 1.0;                                             \
            }                                                           \
        }                                                               \
                                                                        \
        console.log(Matrix._identityReadOnly);                          \
    '])));

    it('Class - initializing property without constructor',  () => expect('10\r\n').to.equals(new Run().test([
        'class Matrix {                                                 \
            public m = [];                                              \
        }                                                               \
                                                                        \
        var result = new Matrix();                                      \
        result.m[0] = 10;                                               \
        console.log(result.m[0]);                                       \
    '])));

});
