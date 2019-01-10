declare var string: any;
class RegExp {
    constructor(private pattern: string, private flags?: string) {
    }

    public test(t: string) {
        return !string.match(t, this.__getLuaPattern());
    }

    public exec(t: string) {
        return string.match(t, this.__getLuaPattern());
    }

    public getPattern(): string {
        return this.pattern;
    }

    public __getLuaPattern(): string {
        return string.gsub(this.pattern, '\\', '%%');
    }
}
