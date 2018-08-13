let test = 1;                                                      
                                                                                
        function inner() {                                                      
            test = 2;                                                        
        }                                                                       
                                                                                
        inner();                                                                
                                                                                
        console.log(test);