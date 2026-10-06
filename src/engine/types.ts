export class CalcError extends Error {}

export type Assoc = 'left' | 'right';

export type TokenKind =
    | 'value'
    | 'binary'
    | 'prefix'
    | 'postfix'
    | 'open'
    | 'close'
    | 'constant';

export interface Context {
    angle: 'deg' | 'rad';
}

export interface BinaryOp<T> {
    precedence: number;
    assoc: Assoc;
    apply: (left: T, right: T) => T;
}

/**
 * One table describes a whole number world: how its literals parse, which
 * operators exist, and what they do. The parser in `shunting.ts` is the same
 * for every table, so scientific (number) and programmer (bigint) share it.
 */
export interface Table<T> {
    binary: Record<string, BinaryOp<T>>;
    /** Function keys. Each one owns the '(' that follows it. */
    prefix: Record<string, (value: T, context: Context) => T>;
    postfix: Record<string, (value: T, context: Context) => T>;
    constants: Record<string, T>;
    parse: (lexeme: string) => T;
    /** True when the lexeme is a literal this table can read. */
    isLiteral: (lexeme: string) => boolean;
}

export const kindOf = <T,>(table: Table<T>, lexeme: string): TokenKind => {
    if (lexeme === '(') return 'open';
    if (lexeme === ')') return 'close';
    if (lexeme in table.constants) return 'constant';
    if (lexeme in table.prefix) return 'prefix';
    if (lexeme in table.postfix) return 'postfix';
    if (lexeme in table.binary) return 'binary';
    return 'value';
};
