import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Breaks', () => {

    it('Break/continue for while/do/for', () => expect('0\r\n1\r\n').to.equals(new Run().test([
        'for (let i = 0; i < 3; i++) {          \
            console.log(i);                     \
            if (i == 0) continue;               \
            break;                              \
        }                                       \
    '])));

    it('Break/continue for for/in', () => expect('1\r\n2\r\n').to.equals(new Run().test([
        'let a = [1, 2, 3, 4];                  \
        for (let i in a) {                      \
            console.log(i);                     \
            if (i == 1) continue;               \
            break;                              \
        }                                       \
    '])));
});
