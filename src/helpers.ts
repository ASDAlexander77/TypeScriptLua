import * as ts from "typescript";

export class Helpers
{
    public static isConstOrLet(node: ts.Node): boolean
    {
        return (node.flags & ts.NodeFlags.Let) == ts.NodeFlags.Let || (node.flags & ts.NodeFlags.Const) == ts.NodeFlags.Const;
    }

    public static isConst(node: ts.Node): boolean
    {
        return (node.flags & ts.NodeFlags.Const) == ts.NodeFlags.Const;
    }

    public static isLet(node: ts.Node): boolean
    {
        return (node.flags & ts.NodeFlags.Let) == ts.NodeFlags.Let;
    }
}