const matches = /(hello \S+)/.exec("This is a hello world!");
if (matches != null)
{
  assert(matches[1] == "hello world!")
  console.log(matches[1]);
}

const re = /quick\s?(brown).+?(jumps)/dgi;
const result = re.exec("The Quick Brown Fox Jumps Over The Lazy Dog");
assert(result != null)

console.log("ALL DONE");
