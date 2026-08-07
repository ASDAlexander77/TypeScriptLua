function main() {
  const str1 = 'Hello';
  const str2 = 'World';

  console.log(str1.concat(' ', str2));
  // Expected output: "Hello World"

  console.log(str2.concat(', ', str1));
  // Expected output: "World, Hello"

  const hello = "Hello, ";
  console.log(hello.concat("Kevin", ". Have a nice day."));
  // Hello, Kevin. Have a nice day.

  const greetList = ["Hello", " ", "Venkat", "!"];
  "".concat(...greetList); // "Hello Venkat!"

  "".concat({}); // "[object Object]"
  "".concat([]); // ""
  //"".concat(null); // "null"
  "".concat(true); // "true"
  "".concat(4, 5); // "45"  
    console.log("ALL DONE");
}
