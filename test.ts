var o = {
    prop: 37,
    f: function () {
        return this.prop;
    }
};

console.log(o.f());

class Class1 {                                 
            public static show() {                      
                console.log("Hello");                   
            }                                           
        }                                               
                                                        
        Class1.show(); 