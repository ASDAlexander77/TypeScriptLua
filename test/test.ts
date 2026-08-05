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
            this.nativeHandle = pcre2adapter.regcomp(pattern, 1);
        }
    }

    public test(t: string) {
        if (this.nativeHandle) {
            // @ts-ignore
            return pcre2adapter.regtest(this.nativeHandle, t);
        }
    }

}