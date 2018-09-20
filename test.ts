	class Event1 {                                                     
            public message: string;                                         
        }                                                                   
                                                                            
        class Handler {                                                     
            info: string;                                                   
            onClickGood = (e: Event1) => { console.log("Handler"); console.log(this); console.log(e); this.info = e.message; };        
        }                                                                   
                                                                            
        let h = new Handler();                                              
        let m = new Event1();                                               
        m.message = "test";                                                 
	console.log("Call on ClickGood");
	console.log(h);
	console.log(m);
	console.log(h.onClickGood);
        h.onClickGood(m);                                                   
        console.log(h.info);