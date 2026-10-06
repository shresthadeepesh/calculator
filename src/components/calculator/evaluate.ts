export const OPERATORS = ['+', '-', '*', '/', '%'] as const;

export type Operator = typeof OPERATORS[number];

const PRECEDENCE: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
};

export class CalcError extends Error {}

export const isOperator = (token: string): token is Operator =>
    (OPERATORS as readonly string[]).includes(token);

const compute = (a: number, b: number, operator: string) => {
    switch (operator) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            if (b === 0) throw new CalcError("Can't divide by zero");
            return a / b;
        case '%':
            if (b === 0) throw new CalcError("Can't divide by zero");
            return a % b;
        default:
            throw new CalcError('Unknown operator');
    }
};

/**
 * Tokens alternate number, operator, number. A trailing operator or a number
 * still being typed ("-", "3.") is tolerated so the screen can preview a
 * half-finished expression.
 */
export const evaluate = (tokens: string[]): number => {
    const parsed: Array<number | Operator> = [];

    tokens.forEach((token, index) => {
        if (isOperator(token) && index % 2 === 1) {
            parsed.push(token);
            return;
        }

        const value = Number(token);
        if (Number.isFinite(value)) parsed.push(value);
    });

    while (parsed.length && typeof parsed[parsed.length - 1] === 'string') parsed.pop();
    if (!parsed.length) throw new CalcError('Nothing to calculate');

    const values: number[] = [];
    const operators: string[] = [];

    const apply = () => {
        const operator = operators.pop() as string;
        const right = values.pop() as number;
        const left = values.pop() as number;
        values.push(compute(left, right, operator));
    };

    parsed.forEach(item => {
        if (typeof item === 'number') {
            values.push(item);
            return;
        }

        while (operators.length && PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[item]) apply();
        operators.push(item);
    });

    while (operators.length) apply();

    const result = values[0];
    if (!Number.isFinite(result)) throw new CalcError('Result is out of range');

    return result;
};

/** Trims floating-point noise: 0.1 + 0.2 reads 0.3, and 2 + 2 reads 4. */
export const format = (value: number) => String(parseFloat(value.toPrecision(12)));

const GLYPHS: Record<string, string> = {
    '*': '×',
    '/': '÷',
    '-': '−',
    '%': 'mod',
};

export const prettify = (tokens: string[]) =>
    tokens
        .map((token, index) => (index % 2 === 1 ? GLYPHS[token] ?? token : token.replace(/^-/, '−')))
        .join(' ');
