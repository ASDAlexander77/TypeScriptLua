function main() {
    const anyString = "Mozilla";

    console.log(anyString.substring(0, 1)); // "M"
    console.log(anyString.substring(1, 0)); // "M"
    
    console.log(anyString.substring(0, 6)); // "Mozill"
    
    console.log(anyString.substring(4)); // "lla"
    console.log(anyString.substring(4, 7)); // "lla"
    console.log(anyString.substring(7, 4)); // "lla"
    
    console.log(anyString.substring(0, 7)); // "Mozilla"
    console.log(anyString.substring(0, 10)); // "Mozilla"    
    console.log("ALL DONE");
}
  
