var s = function () {
	console.log("asd");
};

s.prototype.test = function () {
	console.log("test");
};

let a = new s();
a.test();

let b = new (function () { console.log("test2"); })();