        var a = { value: 1 };                         
        console.log(<any>(++((<any>a).value)));        
        console.log(<any>(--((<any>a).value)));        
        console.log(<any>(((<any>a).value)++));        
        console.log(<any>(((<any>a).value)--));        
