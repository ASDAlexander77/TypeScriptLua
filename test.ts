let person = {fname:"John", lname:"Doe", age:25};      
                                                                
        let text = "";                                          
        let x;                                                  
        for (x in person) {                                     
            text += person[x] + " ";                            
        }                                                       
        console.log(text); 