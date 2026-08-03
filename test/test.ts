let events = {}
const eventName = "test"
let cb: any;

let listeners = events[eventName];
if (!listeners) {
    listeners = [];
    events[eventName] = listeners;
}

listeners.push(cb);
