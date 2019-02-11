import './JS';

console.log("Test test Test test".replace(/te(st)/g, function (m:string, p1:string) { return "match:" + m + " p1: " + p1; }));
