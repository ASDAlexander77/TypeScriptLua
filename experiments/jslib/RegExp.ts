declare var string: any;
class RegExp {

    private static loaded = false;

    constructor(private pattern: string, private flags?: string) {
        if (!RegExp.loaded) {
            RegExp.loaded = true;
            // @ts-ignore
            import pcre2_adapter from 'array_buffer';
        }
    }

    public test(t: string) {
        if (!t) {
            return false;
        }

        return !string.match(t, this.__getLuaPattern());
    }

    public exec(t: string) {
        if (!t) {
            return false;
        }

        return string.match(t, this.__getLuaPattern());
    }

    public getPattern(): string {
        return this.pattern;
    }

    public __getLuaPattern(): string {
        return string.gsub(string.gsub(string.gsub(this.pattern, '%+%?', '+'), '%*%?', '*'), '\\', '%%');
    }
}
