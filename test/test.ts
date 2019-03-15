import './JS';

class Tools {
    public static _WarnEnabled(message: string): void {
        console.warn("BJS - " + message);
    }
}

class Test1 {
    public static Warn: (message: string) => void = Tools._WarnEnabled;
}


Test1.Warn("Hello");
