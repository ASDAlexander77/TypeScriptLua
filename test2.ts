import { ZipCodeValidator as ZCV } from './test';

const myValidator = new ZCV();

console.log(myValidator.isAcceptable('test'));
