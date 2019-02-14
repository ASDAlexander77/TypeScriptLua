import './JS';

const a = [1, 2, 3];

print("a index: ");
print(a[0]);
print(a[1]);
print(a[2]);

print("a for/each: ");
for (const c of a) {
	print(c);
}

function fff(...objs: any[]) {
    print("objs index: ");
    //print(objs[0]);
    print(objs[1]);
    print(objs[2]);
    print(objs[3]);

    print("objs for/each: ");
    for (const c of objs) {
	print(c);
    }

}

fff(1, 2, 3);
