import { BaseKey, Table, programmer, scientific } from '../../engine';

export type Mode = 'basic' | 'scientific' | 'programmer' | 'converter';

export const MODES: Array<{ key: Mode; label: string }> = [
    { key: 'basic', label: 'Basic' },
    { key: 'scientific', label: 'Scientific' },
    { key: 'programmer', label: 'Programmer' },
    { key: 'converter', label: 'Converter' },
];

export interface HistoryEntry {
    id: number;
    expression: string;
    result: string;
}

export interface ConverterState {
    category: string;
    from: string;
    to: string;
}

export interface IState {
    mode: Mode;
    /** Lexemes in entry order: numbers, operators, functions, brackets. */
    tokens: string[];
    result: string | null;
    error: string | null;
    /** True right after `=`, so the next digit starts a new expression. */
    settled: boolean;
    angle: 'deg' | 'rad';
    /** Flips sin to asin, ln to e^, √ to x², M+ to M−. */
    inverse: boolean;
    base: BaseKey;
    memory: number;
    history: HistoryEntry[];
    converter: ConverterState;
}

export const initialState: IState = {
    mode: 'basic',
    tokens: [],
    result: null,
    error: null,
    settled: false,
    angle: 'deg',
    inverse: false,
    base: 'dec',
    memory: 0,
    history: [],
    converter: { category: 'length', from: 'm', to: 'ft' },
};

/** Which number world the current mode runs in. */
export const tableFor = (state: IState): Table<any> =>
    state.mode === 'programmer' ? programmer(state.base) : scientific;
