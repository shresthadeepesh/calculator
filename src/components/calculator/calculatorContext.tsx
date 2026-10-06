import React, { FC, useContext, createContext, useReducer } from 'react';
import { calculatorReducer, IAction } from './calculatorReducer';
import { IState, initialState } from './state';

export type { IState, Mode } from './state';

export interface IContextState {
    state: IState;
    dispatch: React.Dispatch<IAction>;
}

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
