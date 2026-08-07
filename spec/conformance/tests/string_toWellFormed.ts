function main() 
{
  const strings = [
    // Lone leading surrogate
    "ab\uD800",
    "ab\uD800c",
    // Lone trailing surrogate
    "\uDFFFab",
    "c\uDFFFab",
    // Well-formed
    "abc",
    "ab\uD83D\uDE04c",
  ];

  for (const str of strings) {
    console.log(str.toWellFormed());
  }
  // Logs:
  // "ab�"
  // "ab�c"
  // "�ab"
  // "c�ab"
  // "abc"
  // "ab😄c"
    console.log("ALL DONE");
}
