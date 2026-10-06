import React, { FC, useContext, createContext, useReducer } from 'react';
import { calculatorReducer, IAction } from './calculatorReducer';

export type { Operator } from './evaluate';

export interface IState {
    /** Alternating number / operator tokens, e.g. ['12', '*', '3.5']. */
    tokens: string[];
    /** Set once `=` lands; null while the expression is still open. */
    result: string | null;
    error: string | null;
    /** True right after `=`, so the next digit starts a new expression. */
    settled: boolean;
}

export interface IContextState {
    state: IState;
    dispatch: React.Dispatch<IAction>;
}

export const initialState: IState = {
    tokens: [],
    result: null,
    error: null,
    settled: false,
};

const CalculatorContext = createContext<IContextState>({
    state: initialState,
    dispatch: () => null,
});

export const CalculatorProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(calculatorReducer, initialState);

    return (
        <CalculatorContext.Provider value={{ state, dispatch }}>
            {children}
        </CalculatorContext.Provider>
    );
};

export const useCalculatorContext = () => useContext(CalculatorContext);
