export class Matrix {
    public static _identityReadOnly = Matrix.Identity();

    public static Identity(): number {
        return 1.0;
    }
}

console.log(Matrix._identityReadOnly);
