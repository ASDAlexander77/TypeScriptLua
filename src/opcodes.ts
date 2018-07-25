export enum Ops {
    MOVE,
    LOADK,
    LOADKX,
    LOADBOOL,
    LOADNIL,
    GETUPVAL,

    GETTABUP,
    GETTABLE,

    SETTABUP,
    SETUPVAL,
    SETTABLE,

    NEWTABLE,

    SELF,

    ADD,
    SUB,
    MUL,
    MOD,
    POW,
    DIV,
    IDIV,
    BAND,
    BOR,
    BXOR,
    SHL,
    SHR,
    UNM,
    BNOT,
    NOT,
    LEN,

    CONCAT,

    JMP,
    EQ,
    LT,
    LE,

    TEST,
    TESTSET,

    CALL,
    TAILCALL,
    RETURN,

    FORLOOP,

    FORPREP,

    TFORCALL,
    TFORLOOP,

    SETLIST,

    CLOSURE,

    VARARG,

    EXTRAARG
}

/* basic instruction format */
export enum OpMode {
    iABC,
    iABx,
    iAsBx,
    iAx
}

export enum OpArgMask {
    OpArgN,  /* argument is not used */
    OpArgU,  /* argument is used */
    OpArgR,  /* argument is a register or a jump offset */
    OpArgK   /* argument is a constant or register/constant */
}

export class opmode {
    public encode(c: Array<number>): number {
        let val = 0;
        let encoded: number = c[0];
        switch (this.mode) {
            case OpMode.iABC:
                // B(9)    Bx   C(9)         A(8)      OP(6)
                // A
                encoded += c[1] << (6);

                // C
                val = c[3];
                if (val < 0) {
                    val = -(val + 1);
                    val |= 1 << 8;
                }

                encoded += val << (8 + 6);

                // B
                val = c[2];
                if (val < 0) {
                    val = -(val + 1);
                    val |= 1 << 8;
                }

                encoded += val << (9 + 8 + 6);

                break;
            case OpMode.iABx:
                encoded += c[1] << (6);
                val = c[2];
                if (val < 0) {
                    val = -(val + 1);
                }
                else {
                    throw new Error("Should be negative");
                }

                encoded += val << (8 + 6);

                break;
            case OpMode.iAsBx:
                encoded += c[1] << (6);

                val = c[2];
                if (val < 0) {
                    val = -(val + 1);
                    val |= 1 << 17;
                }

                encoded += val << (8 + 6);

                break;
            case OpMode.iAx:
                val = c[1];
                if (val < 0) {
                    val = -(val + 1);
                }
                else {
                    throw new Error("Should be negative");
                }

                encoded += val << (6);

                break;
        }

        return encoded;
    }

    public constructor(public T: number, public A: number, public B: OpArgMask, public C: OpArgMask, public mode: OpMode) {
    }
}

export const OpCodes: Array<opmode> = [
    new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iABC)		/* OP_MOVE */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgN, OpMode.iABx)		/* OP_LOADK */
    , new opmode(0, 1, OpArgMask.OpArgN, OpArgMask.OpArgN, OpMode.iABx)		/* OP_LOADKX */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpMode.iABC)		/* OP_LOADBOOL */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpMode.iABC)		/* OP_LOADNIL */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpMode.iABC)		/* OP_GETUPVAL */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgK, OpMode.iABC)		/* OP_GETTABUP */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgK, OpMode.iABC)		/* OP_GETTABLE */
    , new opmode(0, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_SETTABUP */
    , new opmode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgN, OpMode.iABC)		/* OP_SETUPVAL */
    , new opmode(0, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_SETTABLE */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpMode.iABC)		/* OP_NEWTABLE */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgK, OpMode.iABC)		/* OP_SELF */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_ADD */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_SUB */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_MUL */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_MOD */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_POW */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_DIV */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_IDIV */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_BAND */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_BOR */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_BXOR */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_SHL */
    , new opmode(0, 1, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_SHR */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iABC)		/* OP_UNM */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iABC)		/* OP_BNOT */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iABC)		/* OP_NOT */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iABC)		/* OP_LEN */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgR, OpMode.iABC)		/* OP_CONCAT */
    , new opmode(0, 0, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iAsBx)	/* OP_JMP */
    , new opmode(1, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_EQ */
    , new opmode(1, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_LT */
    , new opmode(1, 0, OpArgMask.OpArgK, OpArgMask.OpArgK, OpMode.iABC)		/* OP_LE */
    , new opmode(1, 0, OpArgMask.OpArgN, OpArgMask.OpArgU, OpMode.iABC)		/* OP_TEST */
    , new opmode(1, 1, OpArgMask.OpArgR, OpArgMask.OpArgU, OpMode.iABC)		/* OP_TESTSET */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpMode.iABC)		/* OP_CALL */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgU, OpMode.iABC)		/* OP_TAILCALL */
    , new opmode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgN, OpMode.iABC)		/* OP_RETURN */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iAsBx)	/* OP_FORLOOP */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iAsBx)	/* OP_FORPREP */
    , new opmode(0, 0, OpArgMask.OpArgN, OpArgMask.OpArgU, OpMode.iABC)		/* OP_TFORCALL */
    , new opmode(0, 1, OpArgMask.OpArgR, OpArgMask.OpArgN, OpMode.iAsBx)	/* OP_TFORLOOP */
    , new opmode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgU, OpMode.iABC)		/* OP_SETLIST */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpMode.iABx)		/* OP_CLOSURE */
    , new opmode(0, 1, OpArgMask.OpArgU, OpArgMask.OpArgN, OpMode.iABC)		/* OP_VARARG */
    , new opmode(0, 0, OpArgMask.OpArgU, OpArgMask.OpArgU, OpMode.iAx)		/* OP_EXTRAARG */
];

export enum LuaTypes {
    LUA_TNIL = 0,
    LUA_TBOOLEAN = 1,
    LUA_TLIGHTUSERDATA = 2,
    LUA_TNUMBER = 3,
    LUA_TSTRING = 4,
    LUA_TTABLE = 5,
    LUA_TFUNCTION = 6,
    LUA_TUSERDATA = 7,
    LUA_TTHREAD = 8,

    LUA_TNUMINT = 3 || (1 << 4),
    LUA_TLNGSTR = 4 || (1 << 4),
}
