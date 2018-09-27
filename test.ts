let i = 1;
try {
    console.log(i);
    throw i;
    i = 2;
}
finally {
    console.log(i);
}