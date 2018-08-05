let deck = {
  suits: ['hearts', 'spades', 'clubs', 'diamonds'],
  createCardPicker: function () {
    return function () {
      return { suit: this.suits[1] };
    }
  }
}

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

console.log(pickedCard.suit);
