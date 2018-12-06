let r, x = 1, y = 2;
r = x || y;
console.log(r);
r = x && y;
console.log(r);

console.log(x && x != 0 ? x : y);
console.log(!x || x == 0 ? x : y);

//x || y -> x && x != 0 ? x : y;
//x && y -> !x || x == 0 ? x : y;
