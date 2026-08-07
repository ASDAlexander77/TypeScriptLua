function main() {
    const items = ["réservé", "Premier", "Cliché", "communiqué", "café", "Adieu"];
    items.sort((a, b) => a.localeCompare(b, "fr"/*, { ignorePunctuation: true }*/));
    items.forEach(v => console.log(v));
    // implement it
    //items.forEach(console.log);

    console.log("ä".localeCompare("z", "de")); // a negative value: in German, ä sorts before z
    console.log("ä".localeCompare("z", "sv")); // a positive value: in Swedish, ä sorts after z    
    console.log("ALL DONE");
}
