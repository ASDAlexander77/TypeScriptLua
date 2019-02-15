let deck = {
    suits: ["hearts"],
    createCardPicker: function () {
        return () => {
            return { suit: this.suits[0] };
        };
    }
};

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

console.log(pickedCard.suit);
