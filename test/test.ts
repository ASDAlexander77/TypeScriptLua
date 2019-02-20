import './JS';

var a;

console.log("strict");
console.log("null === null", null === null);
console.log("undefined === null", undefined === null);
console.log("undefined === undefined", undefined === undefined);
console.log("null !== null", null !== null);
console.log("undefined !== null", undefined !== null);
console.log("undefined !== undefined", undefined !== undefined);

console.log("non strict || false");
console.log("null == null", (null || false) == (null || false));
console.log("undefined == null", (undefined  || false) == (null || false));
console.log("undefined == undefined", (undefined || false) == (undefined || false));
console.log("null != null", (null || false) != (null || false));
console.log("null != undefined", (null || false) != (undefined || false));
console.log("undefined != undefined", (undefined || false) != (undefined || false));

console.log("non strict");
console.log("null == null", null == null);
console.log("undefined == null", undefined == null);
console.log("undefined == undefined", undefined == undefined);
console.log("null != null", null != null);
console.log("undefined != null", undefined != null);
console.log("undefined != undefined", undefined != undefined);

