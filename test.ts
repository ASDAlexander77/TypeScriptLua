let person = {fname:"John", lname:"Doe"};      
                                                                
        let text = "";                                          
        let x;                                                  
        for (x in person) {                                     
            text += person[x] + " ";                            
        }                                                       
        console.log(text); 