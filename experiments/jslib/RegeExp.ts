class RegExp {
    constructor(private pattern: string, private flags?: string) {
    }

    public test(t: string) {
        return false;
    }
}
