function f() {                         
            var a = 1;                          

            function g() {                      
                return a;                       
            }                                   
                                                
            a = 2;                              
            var b = g();                        
            a = 3;                              
                                                
            return b;                           
                                               
        }                                       
                                                
        console.write(f()); 