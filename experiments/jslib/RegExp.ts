declare var string: any;
declare var pcre2adapter: any; // to make it visible to the whole class
class RegExp {

    private static loaded = false;
    private nativeHandle: any;
    private isGlobal: boolean;
    private lastIndex: number;

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
                        case 'g': this.isGlobal = true; break;
                        case 'i': flagsEnum |= 1; /*REG_ICASE*/ break;
                        case 'm': flagsEnum |= 2; /*REG_NEWLINE*/ break;
                    }
                }
            }

            this.nativeHandle = pcre2adapter.regcomp(pattern, flagsEnum);
        }
    }

    public test(t: string) {
        if (!t) {
            return false;
        }

        if (this.nativeHandle) {
            // @ts-ignore
            return pcre2adapter.regtest(this.nativeHandle, t);
        }

        return !string.match(t, this.__getLuaPattern());
    }

    // the return type is what tells a consuming compile that the match elements are strings.
    // left as 'any' it infects every 'match[n]' with 'any', and the preprocessor then emits a
    // dynamic 'match[n]:indexOf(...)' instead of 'StringHelper.indexOf(match[n], ...)' - which
    // fails at runtime, because the elements are raw Lua strings with no JS methods on them
    public exec(t: string): RegExpExecArray | null {
        if (!t) {
            return null;
        }

        if (this.nativeHandle) {
            // @ts-ignore
            const matchResult = pcre2adapter.regexec(this.nativeHandle, t, this.lastIndex !== undefined ? this.lastIndex + 1 : null);
            if (matchResult) {
                this.lastIndex = matchResult.index;
            }

            return matchResult;
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
