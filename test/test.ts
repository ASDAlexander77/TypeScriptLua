	let a;                                 
        let b = 1;                              
                                                
        function f() {                          
            let s = null;                       
            s();                                
            return 2;                           
        }                                       
                                                
        a = b || f();                           
                                                
        console.log(a);                         