function main() {
    const str1 = 'Breaded Mushrooms';

    console.log(str1.padEnd(25, '.'));
    // Expected output: "Breaded Mushrooms........"
    
    const str2 = '200';
    
    console.log(str2.padEnd(5));
    // Expected output: "200  "

    console.log("abc".padEnd(10)); // "abc       "
    console.log("abc".padEnd(10, "foo")); // "abcfoofoof"
    console.log("abc".padEnd(6, "123456")); // "abc123"
    console.log("abc".padEnd(1)); // "abc"
    console.log("ALL DONE");
}
