import React, { FC, useContext, createContext, useReducer } from 'react';
import { calculatorReducer } from './calculatorReducer';

export type Operator = '+' | '-' | '*' | '/' | '=' | '%' | 'AC' | '<-' | '.';

export interface IState {
    value: number[] | Operator[];
    result: number | null;
}

export interface IContextState {
    state: IState;
    dispatch: React.Dispatch<any>;
}

export const initialState = {
    value: [],
    result: null,
}

export const defaultValue = {
    state: initialState,
    dispatch: () => null
}

const CalculatorContext = createContext<IContextState>(defaultValue);

export const CalculatorProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(calculatorReducer, initialState);

    return (
        <CalculatorContext.Provider value={{ state, dispatch }}>
            {children}
        </CalculatorContext.Provider>
    );
}

export const useCalculatorContext = () => useContext(CalculatorContext);