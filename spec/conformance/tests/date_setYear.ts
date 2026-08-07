const theBigDay = new Date();

theBigDay.setYear(96);
assert(theBigDay.getYear() == 96)

theBigDay.setYear(1996);

console.log(theBigDay.getYear());

theBigDay.setYear(2000);

console.log(theBigDay.getYear());

console.log("ALL DONE");
