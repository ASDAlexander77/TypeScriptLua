function main() {

    const inventory = [
        { name: "apples", quantity: 2 },
        { name: "bananas", quantity: 0 },
        { name: "cherries", quantity: 5 },
    ];

    function isCherries(fruit: { name: string, quantity: int }) {
        return fruit.name === "cherries";
    }

    console.log(inventory.find(isCherries));
    // { name: 'cherries', quantity: 5 }
    console.log("ALL DONE");
}
