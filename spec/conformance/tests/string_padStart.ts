function main() {
    const str1 = '5';

    console.log(str1.padStart(2, '0'));
    // Expected output: "05"

    console.log("abc".padStart(10)); // "       abc"
    console.log("abc".padStart(10, "foo")); // "foofoofabc"
    console.log("abc".padStart(6, "123465")); // "123abc"
    console.log("abc".padStart(8, "0")); // "00000abc"
    console.log("abc".padStart(1)); // "abc"
    console.log("ALL DONE");
}
