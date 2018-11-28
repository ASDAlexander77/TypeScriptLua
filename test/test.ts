declare var print;

function f(events1: { name: string; handler: any; }[]) {
    print(events1[0].name);
    print(events1[1].name);
    if (events1[2]) print("failed");
}

let a = { name: "blur", handler: 1 };
let c = [a, a];
f(c);

