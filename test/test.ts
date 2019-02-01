import './JS';

const str:String = new String("asd");
str.__tostring = function (): string {
    console.log("__tostring ");
    return "he he";
};

const s = <string>str;

console.log("Output:");
console.log(str);
console.log(s);
