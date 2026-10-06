import { CalcError, Context, kindOf, Table } from './types';

/** Dijkstra's shunting-yard: infix lexemes to reverse Polish. */
const toRpn = <T,>(tokens: string[], table: Table<T>): string[] => {
    const output: string[] = [];
    const stack: string[] = [];

    tokens.forEach(token => {
        const kind = kindOf(table, token);

        switch (kind) {
            case 'value':
            case 'constant':
                output.push(token);
                return;

            case 'postfix':
                output.push(token);
                return;

            case 'prefix':
            case 'open':
                stack.push(token);
                return;

            case 'close': {
                while (stack.length && stack[stack.length - 1] !== '(') {
                    output.push(stack.pop() as string);
                }
                if (!stack.length) throw new CalcError('Unbalanced brackets');
                stack.pop();
                if (stack.length && kindOf(table, stack[stack.length - 1]) === 'prefix') {
                    output.push(stack.pop() as string);
                }
                return;
            }

            case 'binary': {
                const current = table.binary[token];
                while (stack.length) {
                    const top = stack[stack.length - 1];
                    if (kindOf(table, top) !== 'binary') break;
                    const previous = table.binary[top];
                    const outranks =
                        previous.precedence > current.precedence ||
                        (previous.precedence === current.precedence && current.assoc === 'left');
                    if (!outranks) break;
                    output.push(stack.pop() as string);
                }
                stack.push(token);
                return;
            }
        }
    });

    while (stack.length) {
        const token = stack.pop() as string;
        if (token === '(') throw new CalcError('Unbalanced brackets');
        output.push(token);
    }

    return output;
};

const evalRpn = <T,>(rpn: string[], table: Table<T>, context: Context): T => {
    const stack: T[] = [];

    rpn.forEach(token => {
        switch (kindOf(table, token)) {
            case 'constant':
                stack.push(table.constants[token]);
                return;

            case 'value':
                stack.push(table.parse(token));
                return;

            case 'prefix':
            case 'postfix': {
                const operand = stack.pop();
                if (operand === undefined) throw new CalcError('That expression is incomplete');
                const op = table.prefix[token] ?? table.postfix[token];
                stack.push(op(operand, context));
                return;
            }

            case 'binary': {
                const right = stack.pop();
                const left = stack.pop();
                if (right === undefined || left === undefined) {
                    throw new CalcError('That expression is incomplete');
                }
                stack.push(table.binary[token].apply(left, right));
                return;
            }

            default:
                throw new CalcError('That expression is incomplete');
        }
    });

    if (stack.length !== 1) throw new CalcError('That expression is incomplete');
    return stack[0];
};

/** Drops a trailing operator or half-typed token, then closes open brackets. */
export const settle = <T,>(tokens: string[], table: Table<T>): string[] => {
    const settled = [...tokens];

    while (settled.length) {
        const last = settled[settled.length - 1];
        const kind = kindOf(table, last);
        const incomplete =
            kind === 'binary' ||
            kind === 'prefix' ||
            kind === 'open' ||
            (kind === 'value' && !table.isLiteral(last));
        if (!incomplete) break;
        settled.pop();
    }

    const depth = settled.reduce(
        (count, token) => count + (token === '(' ? 1 : token === ')' ? -1 : 0),
        0
    );

    return [...settled, ...Array(Math.max(depth, 0)).fill(')')];
};

export const evaluate = <T,>(tokens: string[], table: Table<T>, context: Context): T => {
    const settled = settle(tokens, table);
    if (!settled.length) throw new CalcError('Nothing to calculate');
    return evalRpn(toRpn(settled, table), table, context);
};
