import React from 'react';
import { IState, Operator } from './calculatorContext';

export enum CalculatorActionType {
    CLEAR,
    EQUAL,
    ENTRY,
    BACKSPACE,
}

interface IAction {
    type: CalculatorActionType;
    payload: any;
}

const precision = 10;

export const calculatorReducer = (state: IState, action: IAction) => {
    switch(action.type) {
        case CalculatorActionType.CLEAR:
            return {
                ...state,
                value: [],
                result: null,
            }

        case CalculatorActionType.ENTRY:
            if((state.value[state.value.length - 1] === "+" || state.value[state.value.length - 1] === "-" || state.value[state.value.length - 1] === "*" || state.value[state.value.length - 1] === "/" || state.value[state.value.length - 1] === "%" || state.value[state.value.length - 1] === ".")
             && (action.payload === "+" || action.payload === "-" || action.payload === "*" || action.payload === "/" || action.payload === "%" || action.payload === ".")
             ) {
                state.value.pop();
            }

            return {
                ...state,
                value: [...state.value, action.payload]
            }

        case CalculatorActionType.EQUAL:
            const res = String(state.value).replaceAll(",", "");
            const result = eval(res); 
            const output = result % 1 !== 0 ? result : result.toFixed(precision);

            return {
                ...state,
                result: output
            }

        case CalculatorActionType.BACKSPACE:
            return {
                ...state,
                value: state.value.slice(0, -1)
            }

        default:
            return state;
    }
}