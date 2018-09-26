class S
{
    public url: string;

    static CreateFromImages(files) {
        let rootUrlKey = '';
        files.forEach(url => rootUrlKey += url);
    }
}
