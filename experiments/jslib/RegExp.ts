declare var string: any;
class RegExp {

    private static loaded = false;
    private nativeHandle: any;

    constructor(private pattern: string, private flags?: string) {
        if (!RegExp.loaded) {
            RegExp.loaded = true;
            // @ts-ignore
            import pcre2adapter from 'pcre2adapter';
        }

        if (pcre2adapter) {
            let flagsEnum = 0;
            if (flags) {
                for (const flag of flags) {
                    switch (flag) {
                        case 'i': flagsEnum |= 1; /*REG_ICASE*/ break;
                        case 'm': flagsEnum |= 2; /*REG_NEWLINE*/ break;
                    }
                }
            }

            this.nativeHandle = pcre2adapter.regcomp(string.gsub(pattern, '\\', '\\\\'), flagsEnum);
        }
    }

    public test(t: string) {
        if (!t) {
            return false;
        }

        if (this.nativeHandle) {
            // @ts-ignore
            return !pcre2adapter.regtest(this.nativeHandle, t);
        }

        return !string.match(t, this.__getLuaPattern());
    }

    public exec(t: string) {
        if (!t) {
            return false;
        }

        if (this.nativeHandle) {
            // @ts-ignore
            return pcre2adapter.regexec(this.nativeHandle, t);
        }

        return string.match(t, this.__getLuaPattern());
    }

    public getPattern(): string {
        return this.pattern;
    }

    public __getLuaPattern(): string {
        return string.gsub(this.pattern, '\\', '%%');
    }
}
