const response = fetch("http://example.com/");
assert(response.ok, "expected 2xx status");
assert(response.text().length > 0, "expected non-empty body");
console.log("status:", `${response.status}`);

console.log("done.");

console.log("ALL DONE");
