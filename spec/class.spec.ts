import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Classes', () => {

    it('Class private member in constructor', () => expect('1\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            constructor(private i: number) {                \
            }                                               \
                                                            \
            public show() {                                 \
              console.log(this.i);                          \
            }                                               \
          }                                                 \
                                                            \
          let c = new Class1(1);                            \
          c.show();                                         \
                                                            \
    '])));

});
