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

    it('Class inheritance - call super class', () => expect('true\r\ntrue\r\nfalse\r\n').to.equals(new Run().test([
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

});
