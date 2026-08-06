let a = [10, 20, 30, 40];              
        for (let i in a._values) {           
	    console.log(i, typeof(i));           
	    if (typeof(i) !== "number") continue;
            console.log(i);                     
            if (count == 0) continue;           
            break;                              
        }
