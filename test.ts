let i = 1;
try {
    console.log(i);
    throw 10;
    i = 2;
} catch (err) {
    console.log('error ');
    console.log(err);
} finally {
    console.log(i);
}
