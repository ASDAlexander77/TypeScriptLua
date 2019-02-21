class undefined {}
        function ffff(f1, f2?, f3?, f4?, f5?, f6?, f7?, f8 = 1) {
        print(f1);
        print(f2 === undefined ? "<error>" : f2);
        print(f3 === null ? "null" : "<error>");
        print(f4 === undefined ? "<error>" : f4);
        print(f5 === undefined ? "undef" : "<error>");
        print(f6 === undefined ? "undef" : "<error>");
        print(f7 === undefined ? "undef" : "<error>");
        print(f8 === undefined ? "<error>" : f8);
        }

    ffff(10, 20, null, 30);
