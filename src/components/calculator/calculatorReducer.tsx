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
            const lastItem = state.value[state.value.length - 1];

            if((lastItem === "+" || lastItem === "-" || lastItem === "*" || lastItem === "/" || lastItem === "%" || lastItem === ".")
             && (action.payload === "+" || action.payload === "-" || action.payload === "*" || action.payload === "/" || action.payload === "%" || action.payload === ".")
             ) {
                state.value.pop();
            }

            if(state.value.length === 0 && (action.payload === "+" || action.payload === "-" || typeof action.payload === 'number')) {
                return {
                    ...state,
                    value: [...state.value, action.payload]
                }
            } else if(state.value.length >= 1) {
                return {
                    ...state,
                    value: [...state.value, action.payload]
                } 
            }

            return state;

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