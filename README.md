TypeScript for LUA
===========================

The TypeScriptLUA repo contains the complete source code implementation for TypeScript compiler for LUA bytecode.

Chat Room
---------

Want to chat with other members of the TypeScript for LUA community?

[![Join the chat at https://gitter.im/ASDAlexander77/cs2cpp](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/TypeScriptLUA/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Engage, Contribute and Provide Feedback
---------------------------------------

Some of the best ways to contribute are to try things out, file bugs, and join in design conversations.


License
-------

TypeScriptLUA is licensed under the MIT license.

Quick Start
-----------

Prerequisite: nodejs, LUA 5.3, VSCode

1) Build Project

```
npm install
npm run build
```

2) Compile test.ts

create file test.ts

```TypeScript
class Class1 {
  constructor(private i: number) {
  }

  public show() {
    console.log(this.i);
  }
}

let c = new Class1(1);
c.show();
```

```
node __out/main.js test.ts
```

Now you have test.luabc

3) Run it.

```
lua test.luabc
```

Result:
```
1
```

Enjoy it. 