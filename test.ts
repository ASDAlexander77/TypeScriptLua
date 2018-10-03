export class Observable<T> {                                       
    constructor(onObserverAdded?: (observer: any) => void) {        
        console.log("Run");                                         
        console.log(onObserverAdded);                                   
        if (onObserverAdded) {                                      
            console.log("Error");                                   
        }                                                           
    }                                                               
}                                                                   
new Observable();