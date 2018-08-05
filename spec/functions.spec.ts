import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Functions', () => {

    it.skip('Optional and Default Parameters', () => expect('Bob Adams\r\nBob Smith\r\n').to.equals(new Run().test([
        'function buildName(firstName: string, lastName: string= "Smith") {      \
            return firstName + " " + lastName;                                   \
        }                                                                        \
                                                                                 \
        let result1 = buildName("Bob", "Adams");                                 \
        let result2 = buildName("Bob");                                          \
        console.log(result1);                                                    \
        console.log(result2);                                                    \
    '])));

    it('function 1', () => expect('spades\r\n').to.equals(new Run().test([
        'let deck = {                                                           \
            suits: ["hearts", "spades", "clubs", "diamonds"],                   \
            createCardPicker: function() {                                      \
                return function() {                                             \
                    return {suit: "spades"};                                    \
                }                                                               \
            }                                                                   \
        }                                                                       \
                                                                                \
        let cardPicker = deck.createCardPicker();                               \
        let pickedCard = cardPicker();                                          \
                                                                                \
        console.log(pickedCard.suit);                                           \
    '])));

    it('this 1', () => expect('37\r\n').to.equals(new Run().test([
        'var o = {                                                              \
        prop: 37,                                                               \
        f: function() {                                                         \
          return this.prop;                                                     \
        }                                                                       \
      };                                                                        \
                                                                                \
      console.log(o.f());                                                       \
    '])));

    // TODO: this is not working in javascript
    it.skip('this 2', () => expect('spades\r\n').to.equals(new Run().test([
        'let deck = {                                                           \
            suits: ["hearts", "spades", "clubs", "diamonds"],                   \
            createCardPicker: function() {                                      \
                return function() {                                             \
                    return {suit: this.suits[1]};                               \
                }                                                               \
            }                                                                   \
        }                                                                       \
                                                                                \
        let cardPicker = deck.createCardPicker();                               \
        let pickedCard = cardPicker();                                          \
                                                                                \
        console.log(pickedCard.suit);                                           \
    '])));

});
