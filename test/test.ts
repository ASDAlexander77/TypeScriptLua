declare var print;
declare var math: any;

function f(c) {
    var r = math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
}

print(f('c'));
print(f('x'));