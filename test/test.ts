const re = /asd/g;
const re2 = /#include<(.+)>(\((.*)\))*(\[(.*)\])*/g;

console.log('test...!');
console.log(re.test('asd'));
console.log(re2.test('#include<__decl__defaultVertex>'));
