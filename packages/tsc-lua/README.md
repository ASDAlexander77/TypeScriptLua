TypeScript for Lua
===========================

License
-------

TypeScriptLua is licensed under the MIT license.

Quick Start
-----------

0) install

```
node -i typescript-lua-compiler
```


1) Compile test.ts

create file test.ts

```TypeScript
declare var print: any;

class Person {
    protected name: string;
    constructor(name: string) { this.name = name; }
}

class Employee extends Person {
    private department: string;

    constructor(name: string, department: string) {
        super(name);
        this.department = department;
    }

    public get ElevatorPitch() {
        return `Hello, my name is ${this.name} and I work in ${this.department}.`;
    }
}

let howard = new Employee("Howard", "Sales");
print(howard.ElevatorPitch);
```

```
tsc-lua test.ts
```

Now you have test.lua

2) Run it.

```
lua test.lua
```

Result:
```
Hello, my name is Howard and I work in Sales.
```

Enjoy it. 

How to use JavaScript Library
-----------

1) Copy JS.lua into your folder where you run the compiled app.

2) Compile test.ts

create file test.ts

```TypeScript
class Person {
    protected name: string;
    constructor(name: string) { this.name = name; }
}

class Employee extends Person {
    private department: string;

    constructor(name: string, department: string) {
        super(name);
        this.department = department;
    }

    public get ElevatorPitch() {
        return `Hello, my name is ${this.name} and I work in ${this.department}.`;
    }
}

let howard = new Employee("Howard", "Sales");
console.log(howard.ElevatorPitch);
```

```
tsc-lua test.ts
```

```
3) Run it.

```
lua -e "require('./JS')" test.lua
```

Result:
```
Hello, my name is Howard and I work in Sales.
```

	Enjoy it